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

def test_studionet_success_is_not_misclassified_from_missing_sdk_field():
    client = (ROOT / "web/src/genlayer.ts").read_text(encoding="utf-8")
    ui = (ROOT / "web/src/main.tsx").read_text(encoding="utf-8")
    assert "executionSucceeded" in client
    assert "consensus_data?.leader_receipt" in client
    assert "result==='SUCCESS'" in client
    assert "readClient.getTransaction({hash})" in client
    assert "outcome===null" in client
    assert "inspectFinalizedWrite" in ui
    assert "Transaction finalized without successful execution." not in client

def test_live_wallet_signing_and_result_panel():
    ui = (ROOT / "web/src/main.tsx").read_text(encoding="utf-8")
    css = (ROOT / "web/src/style.css").read_text(encoding="utf-8")
    sdk = (ROOT / "web/src/genlayer.ts").read_text(encoding="utf-8")
    assert "tx-monitor-spinner" in ui and "tx-monitor-program" in ui
    assert "LIVE TRANSACTION" in ui and "FINALIZED · GENVM SUCCESS" in ui
    assert "onStatus?.(status)" in sdk and "executionSucceeded(tx)" in sdk
    assert "FINALIZED but execution result is unverified" in sdk
    assert "Recheck on-chain (no signature)" in ui
    assert "position:fixed" in css and "tx-spin" in css

def test_create_program_keeps_user_on_create_page_and_docks_monitor():
    ui=(ROOT/"web/src/main.tsx").read_text(encoding="utf-8")
    css=(ROOT/"web/src/style.css").read_text(encoding="utf-8")
    assert "const UI_RELEASE='WALLET VIEW · R4'" in ui
    assert "className=\"create-workspace\"" in ui
    assert "className=\"create-side-rail\"" in ui
    assert "Wallet activity, in real time." in ui
    assert "tab!=='create'&&liveTx&&<aside" in ui
    assert "liveTx?.fn==='create_program'" in ui
    assert "create-inline-result" in ui
    assert "onClick={()=>{setSelected(liveTx.programId!);setTab('programs')}}" in ui
    assert "create.attestor.trim()])" in ui
    assert "create.attestor.trim()],()=>setTab('programs')" not in ui
    assert ".create-side-rail .tx-monitor{position:relative" in css

def test_wallet_scoped_programs_and_explicit_shared_lookup():
    ui=(ROOT/"web/src/main.tsx").read_text(encoding="utf-8")
    assert "WALLET VIEW · R4" in ui
    assert "p.issuer.toLowerCase()===account.toLowerCase()" in ui
    assert "My programs" in ui
    assert "Have a Program ID?" in ui
    assert "get_program',[id]" in ui
    assert "Public evidence is available through explicit links." in ui
    assert "Explore testnet programs" not in ui
    assert "ON-CHAIN PROGRAMS</span><strong>{programTotal" not in ui
    assert "Public claims" in ui or "Public Claims" in ui
