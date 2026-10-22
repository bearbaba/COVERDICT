import assert from 'node:assert/strict';
import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionHashVariant} from 'genlayer-js/types';

// Public, read-only acceptance checks against the deployed stable Studionet
// contract. No wallet, signing key or sensitive user data is required.
const address='0x044DB5B1d148d30f8EdF591497d8726F66C22a16';
const client=createClient({chain:studionet});
const read=async(fn,args=[])=>client.readContract({
 address,functionName:fn,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL,
});
const withTimeout=(promise,label)=>Promise.race([
 promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(`${label} timed out`)),18000)),
]);

assert.equal(studionet.id,61999,'Do not use the Studio-dev network with this contract');
assert.equal(studionet.rpcUrls.default.http[0],'https://studio.genlayer.com/api');

const count=Number(await withTimeout(read('get_program_count'),'program_count'));
assert.ok(count>=3,`Expected at least three programs, got ${count}`);
console.log('PASS get_program_count:',count);

const claims=Number(await withTimeout(read('get_case_count'),'case_count'));
assert.ok(claims>=1,`Expected at least one claim, got ${claims}`);
console.log('PASS get_case_count:',claims);

const program=await withTimeout(read('get_program',[2]),'program2');
assert.equal(program.id,2);
assert.equal(program.award_credits,100);
assert.equal(program.policy_sha256,'3aecb23e16be10a42f929442ee928850c653a170da3d8aace136e38b579183bc');
console.log('PASS get_program(2):',program.status,program.submitted,program.approved,program.claimed);

const program3=await withTimeout(read('get_program',[3]),'program3');
assert.equal(program3.id,3);
assert.equal(program3.issuer.toLowerCase(),'0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb');
assert.equal(program3.label,'Sepolia missing-proof verification drill #3');
assert.equal(program3.incident_start,1792647900);
assert.equal(program3.incident_end,1792648020);
assert.equal(program3.claim_deadline,1792650600);
assert.equal(program3.award_credits,100);
assert.equal(program3.max_claims,3);
assert.equal(program3.policy_sha256,'48be0cec000526461ee631009b93023a5fe3fe3b29150bd4126c873a7eda2a54');
assert.equal(program3.policy_url,'https://raw.githubusercontent.com/bearbaba/COVERDICT/64249db45a427d02f3b362553456f412866e6f12/evidence/demo_program_03_policy.txt');
// Reporting is expected only after the incident interval. Once attached,
// do not falsely expect status AWAITING_INCIDENT_REPORT forever.
assert.ok(['AWAITING_INCIDENT_REPORT','OPEN_FOR_CLAIMS'].includes(program3.status));
assert.equal(program3.approved,0);
assert.equal(program3.claimed,0);
console.log('PASS get_program(3):',program3.status,'submitted',program3.submitted,'approved',program3.approved);


const claim=await withTimeout(read('get_case',[1]),'case1');
assert.equal(claim.program_id,2);
assert.equal(claim.status,'CLAIMED');
assert.equal(claim.outcome,'ELIGIBLE');
assert.equal(claim.claimed,true);
assert.equal(claim.award_credits,100);
console.log('PASS get_case(1):',claim.status,claim.outcome);

const declined=await withTimeout(read('get_case',[2]),'case2');
assert.equal(declined.program_id,2);
assert.equal(declined.status,'DENIED');
assert.equal(declined.outcome,'INELIGIBLE');
assert.equal(declined.claimant.toLowerCase(),'0xd6b8a3a5eb329410d9504784812b8569afa8c2af');
assert.equal(declined.tx_hash.toLowerCase(),'0x51a7fe56dca8f0bc9bc883d0d0e59113df8160db924fac5de375dbdab20e2151');
assert.equal(declined.award_credits,0);
assert.equal(declined.claimed,false);
assert.equal(declined.attempts,1);
assert.equal(declined.evidence_digest,'8e81c418b1a6667af55310885e59bae29020f1d5f77a2a00ed6437002f63ac2a');
console.log('PASS get_case(2):',declined.status,declined.outcome,'credits',declined.award_credits);

const walletB='0xd6b8a3a5eb329410d9504784812b8569afa8c2af';
const balanceB=Number(await withTimeout(read('get_demo_balance',[walletB]),'wallet_B_demo_balance'));
assert.equal(balanceB,0,'Denied claimant wallet B must not have demo credits');
console.log('PASS wallet B demo balance after denied award retry:',balanceB);

const updatedProgram=await withTimeout(read('get_program',[2]),'program2_counters_after_denial');
assert.ok(updatedProgram.submitted>=2,'A second claim must count as submitted');
assert.equal(updatedProgram.approved,1,'Denied case must not increase approvals');
assert.equal(updatedProgram.claimed,1,'Denied case must not increase claims of awards');
console.log('PASS Program #2 submitted/approved/claimed:',updatedProgram.submitted,updatedProgram.approved,updatedProgram.claimed);


const credits=Number(await withTimeout(read('get_demo_balance',[claim.claimant]),'demo_balance'));
assert.equal(credits,100);
console.log('PASS get_demo_balance:',credits);
console.log('ALL LIVE STUDIONET READ CHECKS PASSED');
