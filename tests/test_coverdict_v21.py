"""V2.1 regression: objective on-chain facts are verified before semantic AI review."""
import importlib.util
import json
import pathlib
import sys
import types
from unittest.mock import patch

import pytest

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("v21_fixture", ROOT / "tests/test_coverdict_v2.py")
old = importlib.util.module_from_spec(spec)
spec.loader.exec_module(old)
support = old.support


@pytest.fixture
def v21():
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
            "coverdict_v21_candidate", ROOT / "contracts/CoverdictV2_1.py")
        module = importlib.util.module_from_spec(spec21)
        spec21.loader.exec_module(module)
        with patch.object(module, "_now", return_value=old.START - 1000) as clock:
            c = module.CoverdictV21()
            c.programs = support.Map()
            c.cases = support.Map()
            c.claimed_wallets = support.Map()
            c.used_transactions = support.Map()
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


def test_semantic_prompt_receives_proven_objective_facts(v21):
    c, gl, nondet, module, _ = v21
    prompts=[]
    answer=nondet.exec_prompt
    def capture(prompt,response_format=None):
        prompts.append(prompt)
        return answer(prompt,response_format)
    nondet.exec_prompt=capture
    assert c.get_contract_version() == "2.1.0-testnet-candidate"
    assert c.submit_claim(1,old.TX)==1
    assert c.resolve_claim(1)=="APPROVED"
    assert len(prompts)==2
    for p in prompts:
        assert "OBJECTIVE FACTS ALREADY CHECKED IN CONTRACT CODE" in p
        assert old.CLAIMANT in p and old.ATTESTOR in p
        assert "Do not require real-world loss" in p
        assert "YOUR ONLY REMAINING QUESTION" in p
    assert c.claim_demo_award(1)==100


def test_missing_attestation_proof_fails_closed_before_model(v21):
    c,gl,nondet,module,_=v21
    c.submit_claim(1,old.TX)
    p=c.get_program(1)
    p["report_attested"]=False
    c._save_program(p)
    with pytest.raises(support.UserError,match="Attested program proof is invalid"):
        c.resolve_claim(1)
    assert c.get_case(1)["attempts"]==0
    assert c.get_demo_balance(old.CLAIMANT)==0


def test_missing_uniqueness_proof_fails_closed_before_model(v21):
    c,gl,nondet,module,_=v21
    c.submit_claim(1,old.TX)
    c.used_transactions[old.TX.lower()]=False
    with pytest.raises(support.UserError,match="Claim uniqueness proof is invalid"):
        c.resolve_claim(1)
    assert c.get_case(1)["attempts"]==0


def test_ambiguous_semantic_scope_never_auto_approves(v21):
    c,gl,nondet,module,_=v21
    nondet.verdict={"outcome":"UNVERIFIABLE","reason":"The two pinned documents do not align on synthetic incident scope."}
    c.submit_claim(1,old.TX)
    assert c.resolve_claim(1)=="SUBMITTED"
    assert c.get_case(1)["outcome"]=="UNVERIFIABLE"
    assert c.get_demo_balance(old.CLAIMANT)==0


def test_wrong_sender_remains_ineligible(v21):
    c,gl,nondet,module,_=v21
    payload=json.loads(nondet.web.data[module.BLOCKSCOUT+old.TX])
    payload["from"]["hash"]=old.OTHER
    nondet.web.data[module.BLOCKSCOUT+old.TX]=json.dumps(payload)
    c.submit_claim(1,old.TX)
    assert c.resolve_claim(1)=="DENIED"
    assert c.get_case(1)["outcome"]=="INELIGIBLE"
