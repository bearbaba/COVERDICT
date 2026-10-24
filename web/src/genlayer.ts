import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {ExecutionResult,TransactionStatus,TransactionHashVariant,type TransactionHash} from 'genlayer-js/types';

export type Program = {
  id:number;issuer:string;attestor:string;report_attested:boolean;attested_at:number;
  label:string;deposit_contract:string;
  incident_start:number;incident_end:number;claim_deadline:number;
  policy_url:string;policy_sha256:string;report_url:string;report_sha256:string;
  award_credits:number;max_claims:number;submitted:number;approved:number;claimed:number;
  status:'AWAITING_INCIDENT_REPORT'|'AWAITING_ATTESTATION'|'OPEN_FOR_CLAIMS';
};
export type CaseRecord = {
  id:number;program_id:number;claimant:string;tx_hash:string;
  status:'SUBMITTED'|'APPROVED'|'DENIED'|'CLAIMED'|'CLOSED_UNVERIFIABLE';
  outcome:''|'ELIGIBLE'|'INELIGIBLE'|'UNVERIFIABLE';
  reason:string;evidence_digest:string;attempts:number;last_attempt_at:number;
  claimed:boolean;award_credits:number;
};
export type TxRecord = {hash:string;label:string;status:'pending'|'finalized'|'failed'|'unverified';at:number};

type Eip1193 = {
  request:(args:{method:string;params?:unknown[]})=>Promise<unknown>;
  on?:(name:string,handler:(...value:unknown[])=>void)=>void;
  removeListener?:(name:string,handler:(...value:unknown[])=>void)=>void;
};
declare global{interface Window{ethereum?:Eip1193}}

// V2 has a distinct ABI and storage. Never silently reuse the legacy V1 address.
const value=import.meta.env.VITE_COVERDICT_V2_CONTRACT_ADDRESS||'';
export const address=value as `0x${string}`;
export const ready=/^0x[a-fA-F0-9]{40}$/.test(value);
// Stable Studionet (61999) needs the stable 1.1.8 release.
// SDK 2.0.0-rc.1 targets the Studio-dev v0.6 preview and fails gen_call on Studionet.
const readClient=createClient({chain:studionet});
function assertReady(){if(!ready)throw new Error('COVERDICT V2 address is not configured. Set VITE_COVERDICT_V2_CONTRACT_ADDRESS.');}
export async function read<T>(fn:string,args:(string|number)[]=[]):Promise<T>{
  assertReady();
  return await readClient.readContract({address,functionName:fn,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL}) as T;
}

async function ensureStudionet(wallet:Eip1193){
  const expected=`0x${studionet.id.toString(16)}`;
  let actual=await wallet.request({method:'eth_chainId'});
  if(actual!==expected){
    try{
      await wallet.request({method:'wallet_switchEthereumChain',params:[{chainId:expected}]});
    }catch(error){
      const code=(error as {code?:number})?.code;
      if(code!==4902)throw error;
      await wallet.request({method:'wallet_addEthereumChain',params:[{
        chainId:expected,
        chainName:studionet.name,
        rpcUrls:[...studionet.rpcUrls.default.http],
        nativeCurrency:studionet.nativeCurrency,
        blockExplorerUrls:[studionet.blockExplorers?.default.url].filter(Boolean),
      }]});
      await wallet.request({method:'wallet_switchEthereumChain',params:[{chainId:expected}]});
    }
    actual=await wallet.request({method:'eth_chainId'});
    if(actual!==expected)throw new Error('Switch wallet to GenLayer Studionet (chain 61999).');
  }
}
export async function connectWallet():Promise<string>{
  const wallet=window.ethereum;
  if(!wallet)throw new Error('Install an EIP-1193 wallet, such as MetaMask.');
  const accounts=await wallet.request({method:'eth_requestAccounts'}) as string[];
  const acc=accounts?.[0];
  if(!acc||!/^0x[a-fA-F0-9]{40}$/.test(acc))throw new Error('Wallet returned no valid account.');
  await ensureStudionet(wallet);
  return acc;
}
// The stable SDK models Studio execution via leader_receipt.execution_result.
// Only an explicit successful result can mark an action FINALIZED as successful.
// Never classify a missing txExecutionResultName as a failed transaction.
function executionSucceeded(tx:import('genlayer-js/types').GenLayerTransaction):boolean|null{
  if(tx.txExecutionResult===1||tx.txExecutionResultName===ExecutionResult.FINISHED_WITH_RETURN)return true;
  if(tx.txExecutionResult!==undefined&&tx.txExecutionResult!==1)return false;
  if(tx.txExecutionResultName===ExecutionResult.FINISHED_WITH_ERROR)return false;
  const receipts=tx.consensus_data?.leader_receipt;
  const leader=Array.isArray(receipts)?receipts[0]:undefined;
  const result=leader?.execution_result?.toUpperCase();
  if(result==='SUCCESS'||result==='FINISHED_WITH_RETURN'||result==='RETURN')return true;
  if(result==='ERROR'||result==='FAILURE'||result==='FINISHED_WITH_ERROR'||result==='TIMEOUT')return false;
  return null;
}

// Reconcile already-submitted transactions read-only: never sign or resubmit.
export async function inspectFinalizedWrite(hash:string):Promise<'finalized'|'failed'|'unverified'>{
  assertReady();
  if(!/^0x[0-9a-fA-F]{64}$/.test(hash))return 'unverified';
  const tx=await readClient.getTransaction({hash:hash as TransactionHash});
  if(tx.statusName!==TransactionStatus.FINALIZED&&tx.status!==7)return 'unverified';
  const result=executionSucceeded(tx);
  return result===true?'finalized':result===false?'failed':'unverified';
}

export async function write(fn:string,args:(string|number)[],account:string,onHash:(hash:string)=>void):Promise<string>{
  assertReady();
  const wallet=window.ethereum;
  if(!wallet||!/^0x[a-fA-F0-9]{40}$/.test(account))throw new Error('Connect your wallet.');
  const activeBefore=await wallet.request({method:'eth_accounts'}) as string[];
  if(!Array.isArray(activeBefore)||activeBefore[0]?.toLowerCase()!==account.toLowerCase())
    throw new Error('Wallet account changed. Reconnect before signing this transaction.');
  await ensureStudionet(wallet);
  const activeAfter=await wallet.request({method:'eth_accounts'}) as string[];
  if(!Array.isArray(activeAfter)||activeAfter[0]?.toLowerCase()!==account.toLowerCase())
    throw new Error('Wallet account changed while connecting. Reconnect and verify the address.');
  const client=createClient({chain:studionet,account:account as `0x${string}`,provider:wallet});
  // Stable 1.1.x uses direct writeContract + value; the v2 RC fee estimator does not exist here.
  const hash=await client.writeContract({address,functionName:fn,args,value:0n});
  onHash(hash);
  const receipt=await readClient.waitForTransactionReceipt({
    hash,status:TransactionStatus.FINALIZED,interval:3500,retries:85,
  });
  // Studionet is a Studio network: genlayer-js 1.1.8 exposes consensus_data
  // rather than txExecutionResultName there. A missing field is NOT a failure.
  let outcome=executionSucceeded(receipt);
  if(outcome===null)outcome=executionSucceeded(await readClient.getTransaction({hash}));
  if(outcome===false)throw new Error('Transaction finalized with a failed GenVM execution. Inspect the transaction in GenLayer Explorer.');
  if(outcome===null)throw new Error('Transaction finalized, but execution could not be independently classified. Inspect GenLayer Explorer before retrying.');
  return hash;
}
export const contractExplorer=(hash:string)=>`https://explorer-studio.genlayer.com/tx/${encodeURIComponent(hash)}`;
