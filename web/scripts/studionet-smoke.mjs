import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionHashVariant} from 'genlayer-js/types';

const address='0x044DB5B1d148d30f8EdF591497d8726F66C22a16';
const caller='0x4C7cb73aC8F8999af21cfc9fF4cF2333a9508Dcb'; // public demo claimant
const client=createClient({chain:studionet});
const accountClient=createClient({chain:studionet,account:caller});
let lastRequest;
const realFetch=globalThis.fetch;
globalThis.fetch=(url,opts={})=>{
 if(opts?.body) {try{const p=JSON.parse(opts.body);if(p.method==='gen_call'){lastRequest=p.params?.[0];}}catch{}}
 return realFetch(url,opts);
};
const timeout=p=>Promise.race([p,new Promise((_,reject)=>setTimeout(()=>reject(new Error('read timeout')),13000))]);
const describe=x=>JSON.stringify(x,(_,v)=>typeof v==='bigint'?v.toString():v).slice(0,320);
const tasks=[
 ['final count',()=>client.readContract({address,functionName:'get_program_count',args:[],transactionHashVariant:TransactionHashVariant.LATEST_FINAL})],
 ['with public caller count',()=>accountClient.readContract({address,functionName:'get_program_count',args:[],transactionHashVariant:TransactionHashVariant.LATEST_FINAL})],
 ['with public caller case',()=>accountClient.readContract({address,functionName:'get_case',args:[1],transactionHashVariant:TransactionHashVariant.LATEST_FINAL})],
];
console.log('Target:',studionet.id,studionet.rpcUrls?.default?.http?.[0],address);
for(const [name,fn] of tasks){
 try{console.log('PASS',name,describe(await timeout(Promise.resolve().then(fn))));}
 catch(error){console.log('FAIL',name,JSON.stringify({message:error?.shortMessage||error?.message,details:error?.details,cause:error?.cause?.message,code:error?.code}).slice(0,600));}
}
console.log('Last gen_call shape:',JSON.stringify({...lastRequest,data:String(lastRequest?.data).slice(0,70)}).slice(0,620));
if(lastRequest){
 const base={...lastRequest,from:caller};delete base.transaction_hash_variant;
 const rpc=[
  ['gen_call plus sender no variant','gen_call',{...base}],
  ['gen_call sender status finalized','gen_call',{...base,status:'finalized'}],
  ['sim_call plus sender','sim_call',{...base}],
  ['sim_call plain status','sim_call',{...base,status:'finalized'}],
 ];
 for(const [label,method,params] of rpc){
  try{
   const v=await timeout(accountClient.request({method,params:[params]}));
   console.log('PASS',label,describe(v));
  }catch(error){console.log('FAIL',label,JSON.stringify({message:error?.shortMessage||error?.message,details:error?.details,cause:error?.cause?.message,code:error?.code}).slice(0,600));}
 }
}
console.log('RPC smoke completed, all calls were read-only.');
