import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionHashVariant} from 'genlayer-js/types';

const address='0x044DB5B1d148d30f8EdF591497d8726F66C22a16';
const client=createClient({chain:studionet});
const timeout=(p)=>Promise.race([p,new Promise((_,reject)=>setTimeout(()=>reject(new Error('read timeout')),15000))]);
const tasks=[
 ['final count',()=>client.readContract({address,functionName:'get_program_count',args:[],transactionHashVariant:TransactionHashVariant.LATEST_FINAL})],
 ['default count',()=>client.readContract({address,functionName:'get_program_count',args:[]})],
 ['nonfinal count',()=>client.readContract({address,functionName:'get_program_count',args:[],transactionHashVariant:TransactionHashVariant.LATEST_NONFINAL})],
 ['final case count',()=>client.readContract({address,functionName:'get_case_count',args:[],transactionHashVariant:TransactionHashVariant.LATEST_FINAL})],
 ['final Program 2',()=>client.readContract({address,functionName:'get_program',args:[2],transactionHashVariant:TransactionHashVariant.LATEST_FINAL})],
 ['schema',()=>client.getContractSchema(address)],
];
console.log('Target:',studionet.id,studionet.rpcUrls?.default?.http?.[0],address);
for(const [name,fn] of tasks){
 try{
  const value=await timeout(Promise.resolve().then(fn));
  const info=name==='schema'?'schema returned':JSON.stringify(value,(_,v)=>typeof v==='bigint'?v.toString():v).slice(0,300);
  console.log('PASS',name,info);
 }catch(error){
  console.log('FAIL',name,JSON.stringify({
   name:error?.name,message:error?.shortMessage||error?.message,
   details:error?.details,
   cause:error?.cause?.shortMessage||error?.cause?.message,
   data:error?.data,code:error?.code,
  }).slice(0,1600));
 }
}
