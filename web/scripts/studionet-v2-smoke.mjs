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
assert.ok(n>=1,'V2 program #1 was finalized but is missing');
const program=await read(v2,'get_program',[1]);
assert.equal(program.id,1);
assert.equal(program.issuer.toLowerCase(),'0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb');
assert.equal(program.attestor.toLowerCase(),'0x60bfdf6315294c7856acdc0b80d7bd40217debff');
assert.equal(program.deposit_contract.toLowerCase(),'0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb');
assert.equal(program.label,'V2 attested Sepolia synthetic receipt drill #1');
assert.equal(program.incident_start,1792659600);
assert.equal(program.incident_end,1792660200);
assert.equal(program.claim_deadline,1792666800);
assert.equal(program.award_credits,100);
assert.equal(program.max_claims,3);
assert.equal(program.policy_sha256,'5150f0cb08b88218dd9fa1e375782b741cc5aaca8f1a96dd0f799f2633bb653c');
assert.equal(program.policy_url,'https://raw.githubusercontent.com/bearbaba/COVERDICT/c2f792197f12d0ab939bf83a0e3179f31f85088d/evidence/v2_program_01_policy.txt');
assert.ok(['AWAITING_INCIDENT_REPORT','AWAITING_ATTESTATION','OPEN_FOR_CLAIMS'].includes(program.status));

if(program.report_url){
  assert.equal(program.report_url,'https://raw.githubusercontent.com/bearbaba/COVERDICT/f85784876f323f2c33a6d9c0b22b4efaa8923493/evidence/v2_program_01_report.txt');
  assert.equal(program.report_sha256,'074f369862b5188cc520678a6424fb1f19c0515ad0d6b222c886ed2a0478683f');
  console.log('PASS V2 Program #1: pinned post-window synthetic report matches SHA256 commit');
}

assert.ok(program.submitted>=0&&program.submitted<=program.max_claims,'Submitted claims out of bounds');
assert.ok(program.approved>=0&&program.approved<=program.submitted,'Approved claims out of bounds');
assert.ok(program.claimed>=0&&program.claimed<=program.approved,'Claimed awards out of bounds');
if(program.status==='AWAITING_INCIDENT_REPORT'){
  assert.equal(program.report_attested,false);
  assert.equal(program.attested_at,0);
  assert.equal(program.report_url,'');
  assert.equal(program.report_sha256,'');
}
if(program.status==='AWAITING_ATTESTATION'){
  assert.equal(program.report_attested,false);
  assert.ok(program.report_url&&program.report_sha256,'Unattested report requires pinned fields');
}
if(program.status==='OPEN_FOR_CLAIMS'){
  assert.equal(program.report_attested,true);
  assert.ok(program.attested_at>=program.incident_end);
  assert.ok(program.report_url&&program.report_sha256,'Attested report requires pinned fields');
}
console.log('PASS V2 role-aware program 1:',program.status,'attestor',program.attestor,'submitted',program.submitted);
console.log('PASS V2 precommitted issuer/policy/recipient/window match the FINALIZED program-create receipt');

assert.equal(program.status,'AWAITING_INCIDENT_REPORT','V2 Program 1 must remain unchanged after expired attach_report rollback');
assert.equal(program.report_url,'','Expired attach_report must not modify Program 1 report URL');
assert.equal(program.report_sha256,'','Expired attach_report must not modify Program 1 report digest');
assert.equal(program.report_attested,false,'Expired attach_report must not authorize attestations');
console.log('PASS expired V2 Program 1 rollback: still awaiting report, no report or attestation');

if(n>=2){
 const replacement=await read(v2,'get_program',[2]);
 assert.equal(replacement.id,2);
 assert.equal(replacement.issuer.toLowerCase(),'0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb');
 assert.equal(replacement.attestor.toLowerCase(),'0x60bfdf6315294c7856acdc0b80d7bd40217debff');
 assert.equal(replacement.deposit_contract.toLowerCase(),'0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb');
 assert.equal(replacement.incident_start,1792672200);
 assert.equal(replacement.incident_end,1792672800);
 assert.equal(replacement.claim_deadline,1792839600);
 assert.equal(replacement.policy_sha256,'e45afdb4965286995263a86d9a2456745438f5747234f56a155b41e2c9eccf3a');
 assert.equal(replacement.policy_url,'https://raw.githubusercontent.com/bearbaba/COVERDICT/8165ba339606315fb2d53111524ad7e0d0478435/evidence/v2_program_02_policy.txt');
 assert.ok(['AWAITING_INCIDENT_REPORT','AWAITING_ATTESTATION','OPEN_FOR_CLAIMS'].includes(replacement.status));
 assert.ok(replacement.submitted>=0&&replacement.submitted<=3);
 assert.ok(replacement.approved>=0&&replacement.approved<=replacement.submitted);
 assert.ok(replacement.claimed>=0&&replacement.claimed<=replacement.approved);
 console.log('PASS V2 replacement Program #2 with pinned policy:',replacement.status,'claims',replacement.submitted);
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
