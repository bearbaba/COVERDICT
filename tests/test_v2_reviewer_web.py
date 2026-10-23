"""Release guard: reviewer V2 web must not silently point at V1 or advertise unverified workflows."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_v2_reviewer_contract_gate():
    client = (ROOT / "web/src/genlayer.ts").read_text(encoding="utf-8")
    ui = (ROOT / "web/src/main.tsx").read_text(encoding="utf-8")
    env = (ROOT / "web/.env.example").read_text(encoding="utf-8")
    assert "VITE_COVERDICT_V2_CONTRACT_ADDRESS" in client
    assert "VITE_COVERDICT_CONTRACT_ADDRESS||" not in client
    assert "0x844BE9205a755900B7a6E40596DeDbdC69825e63" in env
    assert "get_contract_version" in ui
    assert "2.0.0-testnet-experimental" in ui


def test_v2_attestor_and_claim_ui():
    client = (ROOT / "web/src/genlayer.ts").read_text(encoding="utf-8")
    ui = (ROOT / "web/src/main.tsx").read_text(encoding="utf-8")
    assert "AWAITING_ATTESTATION" in client
    assert "report_attested" in client
    assert "attest_report" in ui
    assert "account.toLowerCase()===selectedProgram.attestor" in ui
    assert "create.attestor.trim()" in ui
    assert "claim_demo_award" in ui


def test_reviewer_scope_is_observed_not_fabricated():
    ui = (ROOT / "web/src/main.tsx").read_text(encoding="utf-8")
    assert "c.id===1&&c.program_id===2&&c.status==='CLAIMED'" in ui
    assert "verifiedExample&&verifiedExampleProgram" in ui
    assert "close_unverifiable_claim" not in ui
    assert "nonredeemable demo" in ui or "non-redeemable demo" in ui
