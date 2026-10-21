import {createClient, isSuccessful} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionHashVariant} from 'genlayer-js/types';

export type Program = {
  id:number;issuer:string;label:string;deposit_contract:string;
  incident_start:number;incident_end:number;claim_deadline:number;
  policy_url:string;policy_sha256:string;report_url:string;report_sha256:string;
  award_credits:number;max_claims:number;submitted:number;approved:number;claimed:number;
  status:'AWAITING_INCIDENT_REPORT'|'OPEN_FOR_CLAIMS';
};
export type CaseRecord = {
  id:number;program_id:number;claimant:string;tx_hash:string;
  status:'SUBMITTED'|'APPROVED'|'DENIED'|'CLAIMED';
  outcome:''|'ELIGIBLE'|'INELIGIBLE'|'UNVERIFIABLE';
  reason:string;evidence_digest:string;attempts:number;last_attempt_at:number;
  claimed:boolean;award_credits:number;
};
export type TxRecord = {hash:string;label:string;status:'pending'|'finalized'|'failed';at:number};

type Eip1193 = {
  request:(args:{method:string;params?:unknown[]})=>Promise<unknown>;
  on?:(name:string,handler:(...value:unknown[])=>void)=>void;
  removeListener?:(name:string,handler:(...value:unknown[])=>void)=>void;
};
declare global{interface Window{ethereum?:Eip1193}}

const value=import.meta.env.VITE_COVERDICT_CONTRACT_ADDRESS||'';
export const address=value as `0x${string}`;
export const ready=/^0x[a-fA-F0-9]{40}$/.test(value);
const readClient=createClient({chain:studionet});
function assertReady(){if(!ready)throw new Error('The COVERDICT contract is not deployed/configured yet.');}
export async function read<T>(fn:string,args:(string|number)[]=[]):Promise<T>{
  assertReady();
  return await readClient.readContract({address,functionName:fn,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL}) as T;
}
export async function connectWallet():Promise<string>{
  if(!window.ethereum)throw new Error('Install an EIP-1193 wallet, such as MetaMask.');
  const accounts=await window.ethereum.request({method:'eth_requestAccounts'}) as string[];
  const acc=accounts?.[0];
  if(!acc||!/^0x[a-fA-F0-9]{40}$/.test(acc))throw new Error('Wallet returned no valid account.');
  const client=createClient({chain:studionet,account:acc as `0x${string}`,provider:window.ethereum});
  await client.connect('studionet');
  return acc;
}
export async function write(fn:string,args:(string|number)[],account:string,onHash:(hash:string)=>void):Promise<string>{
  assertReady();
  if(!window.ethereum||!/^0x[a-fA-F0-9]{40}$/.test(account))throw new Error('Connect your wallet.');
  const client=createClient({chain:studionet,account:account as `0x${string}`,provider:window.ethereum});
  await client.connect('studionet');
  const payload={address,functionName:fn,args};
  const fee=await client.estimateTransactionFeesForWrite(payload);
  const hash=await client.writeContract({...payload,fees:{distribution:fee.distribution,feeValue:fee.feeValue}});
  onHash(hash);
  const receipt=await readClient.waitForFinalization({hash});
  if(!isSuccessful(receipt))throw new Error('Transaction reached consensus without successful execution. Inspect explorer receipt.');
  return hash;
}
export const contractExplorer=(hash:string)=>`https://explorer-studio.genlayer.com/tx/${encodeURIComponent(hash)}`;
