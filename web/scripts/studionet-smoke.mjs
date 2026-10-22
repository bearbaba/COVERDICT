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
assert.ok(count>=2,`Expected at least two programs, got ${count}`);
console.log('PASS get_program_count:',count);

const claims=Number(await withTimeout(read('get_case_count'),'case_count'));
assert.ok(claims>=1,`Expected at least one claim, got ${claims}`);
console.log('PASS get_case_count:',claims);

const program=await withTimeout(read('get_program',[2]),'program2');
assert.equal(program.id,2);
assert.equal(program.award_credits,100);
assert.equal(program.policy_sha256,'3aecb23e16be10a42f929442ee928850c653a170da3d8aace136e38b579183bc');
console.log('PASS get_program(2):',program.status,program.submitted,program.approved,program.claimed);

const claim=await withTimeout(read('get_case',[1]),'case1');
assert.equal(claim.program_id,2);
assert.equal(claim.status,'CLAIMED');
assert.equal(claim.outcome,'ELIGIBLE');
assert.equal(claim.claimed,true);
assert.equal(claim.award_credits,100);
console.log('PASS get_case(1):',claim.status,claim.outcome);

const credits=Number(await withTimeout(read('get_demo_balance',[claim.claimant]),'demo_balance'));
assert.equal(credits,100);
console.log('PASS get_demo_balance:',credits);
console.log('ALL LIVE STUDIONET READ CHECKS PASSED');
