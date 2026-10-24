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
  status:'SUBMITTED'|'APPROVED'|'DENIED'|'CLAIMED'|'CLOSED_UNVERIFIABLE'|'EXPIRED'|'CANCELLED_UNVERIFIABLE'|'REPLAY_REJECTED'|'CAPACITY_FULL';
  outcome:''|'ELIGIBLE'|'INELIGIBLE'|'UNVERIFIABLE';
  reason:string;evidence_digest:string;attempts:number;last_attempt_at:number;
  claimed:boolean;award_credits:number;
  submitted_at?:number;expires_at?:number;
};
export type TxRecord = {hash:string;label:string;status:'pending'|'finalized'|'failed'|'unverified';at:number};

type Eip1193 = {
  request:(args:{method:string;params?:unknown[]})=>Promise<unknown>;
  on?:(name:string,handler:(...value:unknown[])=>void)=>void;
  removeListener?:(name:string,handler:(...value:unknown[])=>void)=>void;
};
declare global{interface Window{ethereum?:Eip1193}}

// V2 is historical; V2.2 is the verified security release, with distinct storage.
// Existing ?program= links are preserved as V2 archive URLs unless a release is explicit.
const search=typeof window==='undefined'?new URLSearchParams():new URLSearchParams(window.location.search);
const releaseParam=search.get('version');
export const release: 'v2'|'v2.2' = releaseParam==='v2'||(!releaseParam&&search.has('program'))?'v2':'v2.2';
const historical=import.meta.env.VITE_COVERDICT_V2_CONTRACT_ADDRESS||'0x844BE9205a755900B7a6E40596DeDbdC69825e63';
const security=import.meta.env.VITE_COVERDICT_V22_CONTRACT_ADDRESS||'0x65F96FB47380996Aa672b1eC1de8DF95451eC150';
const value=release==='v2'?historical:security;
export const address=value as `0x${string}`;
export const ready=/^0x[a-fA-F0-9]{40}$/.test(value);
export const contractVersion=release==='v2'?'2.0.0-testnet-experimental':'2.2.0-testnet-admission-candidate';
export const releaseUrl=(target:'v2'|'v2.2',program?:number)=>{
  const url=new URL(window.location.href);
  url.searchParams.set('version',target);
  if(program!==undefined)url.searchParams.set('program',String(program));
  else url.searchParams.delete('program');
  return url.pathname+url.search;
};
// Stable Studionet (61999) needs the stable 1.1.8 release.
// SDK 2.0.0-rc.1 targets the Studio-dev v0.6 preview and fails gen_call on Studionet.
// The browser calls the app origin, which forwards JSON-RPC to the documented
// GenLayer Studionet endpoint. This avoids browser CORS on the upstream API.
// Do not mutate the imported shared chain object: this SDK may do so for endpoint overrides.
const rpcEndpoint=typeof window==='undefined'
  ?'https://studio.genlayer.com/api'
  :new URL('/genlayer-rpc',window.location.origin).toString();
const appStudionet={...studionet,rpcUrls:{
  ...studionet.rpcUrls,
  default:{...studionet.rpcUrls.default,http:[rpcEndpoint]},
}};
const readClient=createClient({chain:appStudionet});
function assertReady(){if(!ready)throw new Error('COVERDICT '+release+' contract address is invalid. Check the release configuration.');}
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

// One status source for UI progress and final verification: the Studio SDK's
// getTransaction exposes actual consensus status and leader execution result.
export async function write(
  fn:string,args:(string|number)[],account:string,
  onHash:(hash:string)=>void,onStatus?:(status:string)=>void,
):Promise<string>{
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
  // Before MetaMask prompts for a signature, verify RPC reachability and ABI.
  // A failed preflight has not broadcast a transaction and must not be retried blindly.
  let version:unknown;
  try{
    version=await readClient.readContract({address,functionName:'get_contract_version',args:[],
      transactionHashVariant:TransactionHashVariant.LATEST_FINAL});
  }catch{
    throw new Error('Studionet RPC preflight failed. No transaction was broadcast. Check connectivity before signing.');
  }
  if(version!==contractVersion)
    throw new Error('Unexpected Studionet contract version. No transaction was broadcast.');
  const client=createClient({chain:appStudionet,account:account as `0x${string}`,provider:wallet});
  const hash=await client.writeContract({address,functionName:fn,args,value:0n});
  onHash(hash);
  onStatus?.('PENDING');
  // Progress is polled from the chain, not simulated. A missing execution result
  // must remain unverified; never treat FINALIZED alone as success.
  for(let attempt=0;attempt<100;attempt++){
    try{
      const tx=await readClient.getTransaction({hash});
      const status=tx.statusName||(tx.status===7?TransactionStatus.FINALIZED:String(tx.status??'PENDING'));
      onStatus?.(status);
      if(status===TransactionStatus.FINALIZED||tx.status===7){
        let outcome=executionSucceeded(tx);
        if(outcome===null){
          await new Promise<void>(r=>setTimeout(r,1800));
          outcome=executionSucceeded(await readClient.getTransaction({hash}));
        }
        if(outcome===false)throw new Error('GenVM execution failed. Inspect the transaction in GenLayer Explorer. Do not sign again.');
        if(outcome===null)throw new Error('FINALIZED but execution result is unverified. Inspect Explorer before retrying; do not sign again.');
        return hash;
      }
      if([TransactionStatus.CANCELED,TransactionStatus.UNDETERMINED,
          TransactionStatus.VALIDATORS_TIMEOUT,TransactionStatus.LEADER_TIMEOUT].includes(status as TransactionStatus))
        throw new Error('Transaction ended without a verified success. Inspect GenLayer Explorer; do not resubmit automatically.');
    }catch(e){
      // Business/consensus errors must be shown; only transient RPC polling errors
      // may retry while the live progress indicator remains visible.
      const message=e instanceof Error?e.message:String(e);
      if(message.includes('GenVM execution failed')||message.includes('FINALIZED but')||
         message.includes('ended without a verified success'))throw e;
      onStatus?.('RPC RECONNECTING');
    }
    await new Promise<void>(r=>setTimeout(r,3500));
  }
  throw new Error('Still waiting for finality. Inspect Explorer using the recorded hash; do not sign again.');
}
export const contractExplorer=(hash:string)=>`https://explorer-studio.genlayer.com/tx/${encodeURIComponent(hash)}`;
