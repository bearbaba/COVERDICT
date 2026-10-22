"""Standalone V2 contract regression suite. V1 deployment is never modified."""
import importlib.util
import json
import pathlib
import sys
import types
from unittest.mock import patch

import pytest

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("v1_test_support", ROOT / "tests/test_coverdict.py")
support = importlib.util.module_from_spec(spec)
spec.loader.exec_module(support)

ISSUER = "0x" + "9" * 40
ATTESTOR = "0x" + "8" * 40
CLAIMANT = support.USER
OTHER = support.OTHER
DEPOSIT = support.DEPOSIT
TX = support.TX
TX2 = support.TX2
START = support.START
END = support.END
DEADLINE = support.DEADLINE
POLICY_URL = support.POLICY_URL
REPORT_URL = support.REPORT_URL
POLICY_SHA = support.POLICY_SHA
REPORT_SHA = support.REPORT_SHA
UserError = support.UserError


@pytest.fixture
def v2():
    vm = support.FakeVM()
    api = support.FakeAPI()
    api.sender_address.as_hex = ISSUER
    nondet = support.FakeNondet()
    gl = types.SimpleNamespace(
        Contract=support.Contract,
        public=types.SimpleNamespace(write=lambda f: f, view=lambda f: f),
        message=api, vm=vm, nondet=nondet)
    genlayer = types.ModuleType("genlayer")
    genlayer.gl = gl
    genlayer.u256 = support.FakeU256
    genlayer.TreeMap = support.Map
    with patch.dict(sys.modules, {"genlayer": genlayer}):
        spec = importlib.util.spec_from_file_location("coverdict_v2_test", ROOT / "contracts/CoverdictV2.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        with patch.object(module, "_now", return_value=START - 1000) as clock:
            c = module.CoverdictV2()
            c.programs = support.Map()
            c.cases = support.Map()
            c.claimed_wallets = support.Map()
            c.used_transactions = support.Map()
            c.credits = support.Map()
            pid = c.create_program("Attested simulated incident", DEPOSIT,
                                   START, END, DEADLINE, POLICY_URL, POLICY_SHA,
                                   100, 10, ATTESTOR)
            assert pid == 1
            def receipt(tx=TX, sender=CLAIMANT, to=DEPOSIT, status="ok", value="100"):
                return {
                    "hash": tx, "from": {"hash": sender}, "to": {"hash": to},
                    "timestamp": "2033-05-18T04:00:00Z",  # replaced at runtime below
                    "status": status, "value": value
                }
            from datetime import datetime, timezone
            def make_receipt(tx=TX, sender=CLAIMANT, to=DEPOSIT, timestamp=START + 400,
                             status="ok", value="100"):
                return {
                    "hash": tx, "from": {"hash": sender}, "to": {"hash": to},
                    "timestamp": datetime.fromtimestamp(timestamp, timezone.utc).isoformat().replace("+00:00", "Z"),
                    "status": status, "value": value
                }
            nondet.web.data = {
                POLICY_URL: support.POLICY, REPORT_URL: support.REPORT,
                module.BLOCKSCOUT + TX: json.dumps(make_receipt()),
                module.BLOCKSCOUT + TX2: json.dumps(make_receipt(tx=TX2, sender=OTHER)),
            }
            yield module, c, gl, clock, make_receipt


def ready(v2):
    m, c, gl, clock, receipt = v2
    clock.return_value = END + 1
    gl.message.sender_address.as_hex = ISSUER
    c.attach_report(1, REPORT_URL, REPORT_SHA)
    gl.message.sender_address.as_hex = ATTESTOR
    c.attest_report(1, REPORT_SHA)
    gl.message.sender_address.as_hex = CLAIMANT
    return m, c, gl, clock, receipt


def test_separate_v2_version_and_witness_precommit(v2):
    m, c, gl, clock, _ = v2
    assert c.get_contract_version() == "2.0.0-testnet-experimental"
    p = c.get_program(1)
    assert p["attestor"] == ATTESTOR
    assert p["issuer"] == ISSUER
    assert p["report_attested"] is False
    assert p["attested_at"] == 0
    assert p["status"] == "AWAITING_INCIDENT_REPORT"
    with pytest.raises(UserError, match="Separate report attestor required"):
        c.create_program("Another test program", DEPOSIT, START, END,
                         DEADLINE, POLICY_URL, POLICY_SHA, 100, 1, ISSUER)
    with pytest.raises(UserError, match="Separate report attestor required"):
        c.create_program("Another test program", DEPOSIT, START, END,
                         DEADLINE, POLICY_URL, POLICY_SHA, 100, 1, "notanaddress")


def test_report_pending_attestation_cannot_open_claims(v2):
    m, c, gl, clock, _ = v2
    clock.return_value = END + 1
    c.attach_report(1, REPORT_URL, REPORT_SHA)
    assert c.get_program(1)["status"] == "AWAITING_ATTESTATION"
    gl.message.sender_address.as_hex = CLAIMANT
    with pytest.raises(UserError, match="Claims not open"):
        c.submit_claim(1, TX)


def test_only_authorized_attestor_may_sign(v2):
    m, c, gl, clock, _ = v2
    clock.return_value = END + 1
    c.attach_report(1, REPORT_URL, REPORT_SHA)
    with pytest.raises(UserError, match="Only designated report attestor"):
        c.attest_report(1, REPORT_SHA)
    gl.message.sender_address.as_hex = ATTESTOR
    with pytest.raises(UserError, match="does not match"):
        c.attest_report(1, "f" * 64)
    c.attest_report(1, REPORT_SHA)
    p = c.get_program(1)
    assert p["status"] == "OPEN_FOR_CLAIMS"
    assert p["report_attested"] is True
    assert p["attested_at"] == END + 1
    with pytest.raises(UserError, match="already attested"):
        c.attest_report(1, REPORT_SHA)


def test_attestor_cannot_sign_before_window_end(v2):
    m, c, gl, clock, _ = v2
    clock.return_value = END - 1
    with pytest.raises(UserError, match="Report submission window"):
        c.attach_report(1, REPORT_URL, REPORT_SHA)


def test_report_cannot_be_replaced_after_attestation(v2):
    _, c, gl, _, _ = ready(v2)
    gl.message.sender_address.as_hex = ISSUER
    with pytest.raises(UserError, match="already committed"):
        c.attach_report(1, REPORT_URL, REPORT_SHA)


@pytest.mark.parametrize("actor", [ISSUER, ATTESTOR])
def test_conflicted_issuer_and_attestor_cannot_claim(v2, actor):
    _, c, gl, _, _ = ready(v2)
    gl.message.sender_address.as_hex = actor
    with pytest.raises(UserError, match="cannot submit claims"):
        c.submit_claim(1, TX)
    assert c.get_program(1)["submitted"] == 0


def test_positive_native_sepolia_claim_and_one_time_credit(v2):
    _, c, gl, _, _ = ready(v2)
    assert c.submit_claim(1, TX) == 1
    assert c.resolve_claim(1) == "APPROVED"
    assert c.get_case(1)["outcome"] == "ELIGIBLE"
    assert c.claim_demo_award(1) == 100
    assert c.get_demo_balance(CLAIMANT) == 100
    with pytest.raises(UserError, match="No unclaimed approved award"):
        c.claim_demo_award(1)


def test_verified_wrong_wallet_is_ineligible(v2):
    m, c, gl, _, _ = ready(v2)
    c.submit_claim(1, TX2)
    assert c.resolve_claim(1) == "DENIED"
    assert c.get_case(1)["outcome"] == "INELIGIBLE"
    assert c.get_demo_balance(CLAIMANT) == 0


def test_missing_receipt_remains_unverifiable(v2):
    m, c, gl, _, _ = ready(v2)
    missing = "0x" + "0" * 63 + "1"
    c.submit_claim(1, missing)
    assert c.resolve_claim(1) == "SUBMITTED"
    item = c.get_case(1)
    assert item["outcome"] == "UNVERIFIABLE"
    assert item["evidence_digest"] == ""
    assert item["award_credits"] == 0
    assert c.get_demo_balance(CLAIMANT) == 0


def test_mutated_pinned_report_fails_closed(v2):
    m, c, gl, _, _ = ready(v2)
    gl.nondet.web.data[REPORT_URL] = "TAMPERED REPORT"
    c.submit_claim(1, TX)
    assert c.resolve_claim(1) == "SUBMITTED"
    assert c.get_case(1)["outcome"] == "UNVERIFIABLE"
    assert c.get_program(1)["approved"] == 0


def test_ambiguous_policy_and_incident_decision_stays_unresolved(v2):
    m, c, gl, _, _ = ready(v2)
    gl.nondet.verdict = {
        "outcome": "UNVERIFIABLE",
        "reason": "The precommitted policy does not clearly cover the issuer's narrative.",
    }
    c.submit_claim(1, TX)
    assert c.resolve_claim(1) == "SUBMITTED"
    assert c.get_case(1)["outcome"] == "UNVERIFIABLE"


def test_llm_explicit_exclusion_becomes_denial(v2):
    m, c, gl, _, _ = ready(v2)
    gl.nondet.verdict = {
        "outcome": "INELIGIBLE",
        "reason": "The issuer's report explicitly rules out the reported event type.",
    }
    c.submit_claim(1, TX)
    assert c.resolve_claim(1) == "DENIED"
    assert c.get_demo_balance(CLAIMANT) == 0


def test_validator_disagreement_causes_no_award(v2):
    _, c, gl, _, _ = ready(v2)
    gl.vm.disagree = True
    c.submit_claim(1, TX)
    with pytest.raises(UserError, match="Validators disagreed"):
        c.resolve_claim(1)
    assert c.get_case(1)["attempts"] == 0
    assert c.get_case(1)["status"] == "SUBMITTED"


def test_consensus_callbacks_do_not_capture_contract_storage(v2):
    m, c, gl, _, _ = ready(v2)
    captured = []
    def inspect(leader, validator):
        captured.extend((leader, validator))
        outcome = leader()
        assert validator(support.Return(outcome))
        return outcome
    gl.vm.run_nondet_unsafe = inspect
    c.submit_claim(1, TX)
    assert c.resolve_claim(1) == "APPROVED"
    assert len(captured) == 2
    for callback in captured:
        cells = tuple(cell.cell_contents for cell in callback.__closure__ or ())
        assert not any(isinstance(v, support.Contract) for v in cells)
        assert all(isinstance(v, dict) for v in cells)


def test_report_attestation_does_not_claim_to_verify_real_loss(v2):
    m, c, gl, _, _ = ready(v2)
    assert c.get_program(1)["report_attested"] is True
    # A signature indicates agreement with a pinned document, not factual truth.
    assert c.get_program(1)["attestor"] == ATTESTOR
    assert c.get_demo_balance(ATTESTOR) == 0
