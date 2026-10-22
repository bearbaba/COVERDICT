import assert from 'node:assert/strict';
import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionHashVariant} from 'genlayer-js/types';

// READ-ONLY. Independent RPC; no wallet, signing, or state mutation.
const v1='0x044DB5B1d148d30f8EdF591497d8726F66C22a16';
const v2='0x844BE9205a755900B7a6E40596DeDbdC69825e63';
const client=createClient({chain:studionet});
const t=(promise,label)=>Promise.race([
  promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(label+' timed out')),20000))
]);
const read=(address,functionName,args=[])=>t(client.readContract({
  address,functionName,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL
}),functionName+' '+address.slice(0,8));

assert.equal(studionet.id,61999,'Not Studionet 61999');
const version=await read(v2,'get_contract_version');
assert.equal(String(version),'2.0.0-testnet-experimental','Unexpected V2 bytecode/API');
console.log('PASS V2 contract version:',version,'at',v2);

const n=Number(await read(v2,'get_program_count'));
const c=Number(await read(v2,'get_case_count'));
assert.ok(Number.isSafeInteger(n)&&n>=0&&Number.isSafeInteger(c)&&c>=0);
console.log('PASS V2 independent state: programs',n,'claims',c);
if(n>0){
  const program=await read(v2,'get_program',[1]);
  assert.equal(program.id,1);
  assert.ok(typeof program.attestor==='string'&&/^0x[0-9a-f]{40}$/i.test(program.attestor));
  assert.ok(typeof program.report_attested==='boolean');
  console.log('PASS V2 role-aware program 1:',program.status,program.attestor);
}

const legacyCount=Number(await read(v1,'get_case_count'));
assert.ok(legacyCount>=3,'Original V1 claim history lost');
const states=[];
for(const id of [1,2,3]){
  const item=await read(v1,'get_case',[id]);
  states.push([item.id,item.outcome,item.status]);
}
assert.equal(states[0][1],'ELIGIBLE');
assert.equal(states[1][1],'INELIGIBLE');
assert.equal(states[2][1],'UNVERIFIABLE');
console.log('PASS legacy V1 case outcomes preserved:',JSON.stringify(states));
console.log('ALL V2 DEPLOYMENT READ-ONLY CHECKS PASSED');
