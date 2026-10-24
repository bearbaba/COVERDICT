"""V2.2 anti-grief regression: only verified claims reserve receipts or award capacity."""
import importlib.util
import json
import pathlib
import sys
import types
from unittest.mock import patch

import pytest

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("v22_fixture", ROOT / "tests/test_coverdict_v2.py")
old = importlib.util.module_from_spec(spec)
spec.loader.exec_module(old)
support = old.support


@pytest.fixture
def v22():
    vm = support.FakeVM()
    api = support.FakeAPI()
    api.sender_address.as_hex = old.ISSUER
    nondet = support.FakeNondet()
    gl = types.SimpleNamespace(Contract=support.Contract,
        public=types.SimpleNamespace(write=lambda f: f, view=lambda f: f),
        message=api, vm=vm, nondet=nondet)
    shim = types.ModuleType("genlayer")
    shim.gl = gl
    shim.u256 = support.FakeU256
    shim.TreeMap = support.Map
    with patch.dict(sys.modules, {"genlayer": shim}):
        spec21 = importlib.util.spec_from_file_location(
            "coverdict_v22_candidate", ROOT / "contracts/CoverdictV2_2.py")
        module = importlib.util.module_from_spec(spec21)
        spec21.loader.exec_module(module)
        with patch.object(module, "_now", return_value=old.START - 1000) as clock:
            c = module.CoverdictV22()
            c.programs = support.Map()
            c.cases = support.Map()
            c.claimed_wallets = support.Map()
            c.used_transactions = support.Map()
            c.pending_wallets = support.Map()
            c.credits = support.Map()
            c.create_program("Attested simulated incident", old.DEPOSIT,
                old.START, old.END, old.DEADLINE, old.POLICY_URL, old.POLICY_SHA,
                100, 1, old.ATTESTOR)
            clock.return_value = old.END + 1
            c.attach_report(1, old.REPORT_URL, old.REPORT_SHA)
            api.sender_address.as_hex = old.ATTESTOR
            c.attest_report(1, old.REPORT_SHA)
            api.sender_address.as_hex = old.CLAIMANT
            from datetime import datetime,timezone
            payload={
                "hash": old.TX, "from":{"hash":old.CLAIMANT},
                "to":{"hash":old.DEPOSIT}, "status":"ok", "value":"100",
                "timestamp":datetime.fromtimestamp(old.START+400,timezone.utc).isoformat().replace("+00:00","Z")
            }
            nondet.web.data={
                old.POLICY_URL:support.POLICY,
                old.REPORT_URL:support.REPORT,
                module.BLOCKSCOUT+old.TX:json.dumps(payload),
            }
            yield c,gl,nondet,module,clock


def test_semantic_prompt_receives_proven_objective_facts(v22):
    c, gl, nondet, module, _ = v22
    prompts=[]
    answer=nondet.exec_prompt
    def capture(prompt,response_format=None):
        prompts.append(prompt)
        return answer(prompt,response_format)
    nondet.exec_prompt=capture
    assert c.get_contract_version() == "2.2.0-testnet-admission-candidate"
    assert c.submit_claim(1,old.TX)==1
    assert c.resolve_claim(1)=="APPROVED"
    assert len(prompts)==2
    for p in prompts:
        assert "OBJECTIVE FACTS ALREADY CHECKED IN CONTRACT CODE" in p
        assert old.CLAIMANT in p and old.ATTESTOR in p
        assert "Do not require real-world loss" in p
        assert "YOUR ONLY REMAINING QUESTION" in p
    assert c.claim_demo_award(1)==100


def test_missing_attestation_proof_fails_closed_before_model(v22):
    c,gl,nondet,module,_=v22
    c.submit_claim(1,old.TX)
    p=c.get_program(1)
    p["report_attested"]=False
    c._save_program(p)
    with pytest.raises(support.UserError,match="Attested program proof is invalid"):
        c.resolve_claim(1)
    assert c.get_case(1)["attempts"]==0
    assert c.get_demo_balance(old.CLAIMANT)==0


def test_provisional_receipt_is_not_permanently_reserved(v22):
    c,gl,nondet,module,_=v22
    c.submit_claim(1,old.TX)
    assert not c.used_transactions.get(old.TX.lower(),False)
    assert c.get_program(1)['approved']==0
    assert c.get_program(1)['submitted']==1


def test_forged_claim_cannot_exhaust_single_slot(v22):
    c,gl,nondet,module,clock=v22
    fake="0x"+"0"*64
    gl.message.sender_address.as_hex=old.OTHER
    assert c.submit_claim(1,fake)==1
    assert c.get_program(1)['approved']==0
    # The valid claimant is NOT blocked by max_claims=1 despite pending forgery.
    gl.message.sender_address.as_hex=old.CLAIMANT
    assert c.submit_claim(1,old.TX)==2
    assert c.resolve_claim(2)=="APPROVED"
    assert c.claim_demo_award(2)==100
    assert c.get_program(1)['submitted']==2
    assert c.get_program(1)['approved']==1
    assert not c.used_transactions.get(fake.lower(),False)


def test_attacker_first_receipt_preemption_does_not_block_owner(v22):
    c,gl,nondet,module,_=v22
    # The hash is publicly visible on Sepolia; attacker is not its sender.
    gl.message.sender_address.as_hex=old.OTHER
    assert c.submit_claim(1,old.TX)==1
    assert not c.used_transactions.get(old.TX.lower(),False)
    assert c.resolve_claim(1)=="DENIED"
    assert c.get_case(1)['outcome']=="INELIGIBLE"
    assert not c.used_transactions.get(old.TX.lower(),False)
    gl.message.sender_address.as_hex=old.CLAIMANT
    assert c.submit_claim(1,old.TX)==2
    assert c.resolve_claim(2)=="APPROVED"
    assert c.claim_demo_award(2)==100
    assert c.get_demo_balance(old.CLAIMANT)==100
    assert c.used_transactions.get(old.TX.lower(),False)


def test_duplicate_unverified_hash_does_not_block_rightful_owner_even_while_pending(v22):
    c,gl,nondet,module,_=v22
    gl.message.sender_address.as_hex=old.OTHER
    assert c.submit_claim(1,old.TX)==1
    gl.message.sender_address.as_hex=old.CLAIMANT
    assert c.submit_claim(1,old.TX)==2
    assert c.resolve_claim(2)=="APPROVED"
    assert c.get_program(1)['approved']==1
    gl.message.sender_address.as_hex=old.OTHER
    assert c.resolve_claim(1)=="REPLAY_REJECTED"
    assert c.get_demo_balance(old.OTHER)==0


def test_cross_program_replay_only_locked_after_approval(v22):
    c,gl,nondet,module,clock=v22
    gl.message.sender_address.as_hex=old.ISSUER
    clock.return_value=old.START-1000
    assert c.create_program("A second program for replay defence",old.DEPOSIT,
        old.START,old.END,old.DEADLINE,old.POLICY_URL,old.POLICY_SHA,100,1,old.ATTESTOR)==2
    clock.return_value=old.END+1
    c.attach_report(2,old.REPORT_URL,old.REPORT_SHA)
    gl.message.sender_address.as_hex=old.ATTESTOR
    c.attest_report(2,old.REPORT_SHA)
    gl.message.sender_address.as_hex=old.CLAIMANT
    assert c.submit_claim(1,old.TX)==1
    assert c.submit_claim(2,old.TX)==2
    assert c.resolve_claim(1)=="APPROVED"
    assert c.resolve_claim(2)=="REPLAY_REJECTED"
    assert c.claim_demo_award(1)==100
    assert c.get_demo_balance(old.CLAIMANT)==100
    with pytest.raises(support.UserError,match="already consumed"):
        c.submit_claim(2,old.TX)


def test_expiring_pending_claim_recovers_wallet_slot(v22):
    c,gl,nondet,module,clock=v22
    fake="0x"+"0"*64
    assert c.submit_claim(1,fake)==1
    with pytest.raises(support.UserError,match="Existing provisional"):
        c.submit_claim(1,old.TX)
    clock.return_value=old.END+1+module.PENDING_TTL_SECONDS
    assert c.expire_pending_claim(1)=="EXPIRED"
    assert c.get_case(1)['award_credits']==0
    assert c.submit_claim(1,old.TX)==2
    assert c.resolve_claim(2)=="APPROVED"
    assert c.claim_demo_award(2)==100


def test_unverifiable_cancel_is_owner_only_and_resubmission_works(v22):
    c,gl,nondet,module,_=v22
    fake="0x"+"0"*64
    c.submit_claim(1,fake)
    assert c.resolve_claim(1)=="SUBMITTED"
    assert c.get_case(1)['outcome']=="UNVERIFIABLE"
    gl.message.sender_address.as_hex=old.OTHER
    with pytest.raises(support.UserError,match="Claimant only"):
        c.cancel_unverifiable_claim(1)
    gl.message.sender_address.as_hex=old.CLAIMANT
    assert c.cancel_unverifiable_claim(1)=="CANCELLED_UNVERIFIABLE"
    assert c.submit_claim(1,old.TX)==2
    assert c.resolve_claim(2)=="APPROVED"
    assert c.claim_demo_award(2)==100


def test_ambiguous_semantic_scope_never_auto_approves(v22):
    c,gl,nondet,module,_=v22
    nondet.verdict={"outcome":"UNVERIFIABLE","reason":"The two pinned documents do not align on synthetic incident scope."}
    c.submit_claim(1,old.TX)
    assert c.resolve_claim(1)=="SUBMITTED"
    assert c.get_case(1)["outcome"]=="UNVERIFIABLE"
    assert c.get_demo_balance(old.CLAIMANT)==0


def test_wrong_sender_remains_ineligible(v22):
    c,gl,nondet,module,_=v22
    payload=json.loads(nondet.web.data[module.BLOCKSCOUT+old.TX])
    payload["from"]["hash"]=old.OTHER
    nondet.web.data[module.BLOCKSCOUT+old.TX]=json.dumps(payload)
    c.submit_claim(1,old.TX)
    assert c.resolve_claim(1)=="DENIED"
    assert c.get_case(1)["outcome"]=="INELIGIBLE"
