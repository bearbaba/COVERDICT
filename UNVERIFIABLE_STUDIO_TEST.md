# COVERDICT — Live UNVERIFIABLE Acceptance Plan

## Status (October 22, 2026)

**Verified precondition, NOT yet adjudicated on GenLayer:** [GitHub Actions](https://github.com/bearbaba/COVERDICT/actions/runs/39724254650) made a live, independent read-only request to Blockscout Sepolia API and returned **HTTP 404** for the syntactically valid 32-byte transaction hash below:

`0x0000000000000000000000000000000000000000000000000000000000000001`

API: `https://eth-sepolia.blockscout.com/api/v2/transactions/0x0000000000000000000000000000000000000000000000000000000000000001`

This is intentional *missing evidence*. Do not claim it is a real transaction, a failed transfer or proof of fraud. As a synthetic test, the correct contract response to nonexistent/unparseable receipt evidence is `UNVERIFIABLE`, not `DENIED` and never `APPROVED`.

## Path A — Program #2 immediately, only if still before 12:00 ICT on October 22

Contract: [COVERDICT on Studionet 61999](https://studio.genlayer.com/?import-contract=0x044DB5B1d148d30f8EdF591497d8726F66C22a16).

Program #2 already has a valid issuer-pinned policy and report. Its immutable deadline is **2026-10-22 12:00 ICT**. Wallet A `0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb` and wallet B `0xd6b8a3a5eb329410d9504784812b8569afa8c2af` have **already each submitted exactly one claim to Program #2**. The contract enforces one claim per wallet per program, whether approved, denied or unresolved.

Therefore Path A requires a **third, genuinely user-controlled wallet C** which has not submitted to Program #2, and a little Studionet test gas. Do not borrow any other user's wallet or private key. Before sending, call `get_program(2)`, confirm submitted less than 10, status `OPEN_FOR_CLAIMS` and current chain time **strictly before 12:00 ICT**. No Sepolia transaction or test-ETH payment is needed.

1. In GenLayer Studio connect wallet C to Studionet 61999.
2. Write `submit_claim(program_id=2, tx_hash="0x0000000000000000000000000000000000000000000000000000000000000001")`. Capture FINALIZED **execution SUCCESS** and submission transaction hash.
3. Read `get_case_count()` and the returned new case ID. Likely case #3 if no intervening submissions, **never assume** the ID.
4. Read `get_case(case_id)`; require claimant C, `SUBMITTED`, `attempts=0`, exact submitted hash.
5. Write `resolve_claim(case_id)` (can be done after noon, during review grace). Capture FINALIZED **execution SUCCESS**, return value, and leader/validator trace.
6. Read `get_case(case_id)` expecting `status=SUBMITTED`, `outcome=UNVERIFIABLE`, `attempts=1`, `reason` indicates unverified evidence, `award_credits=0`, `claimed=false`, `evidence_digest=''`.
7. Check `get_demo_balance(wallet C)` unchanged (expected zero if unused). `get_program(2)` should add one submission only, with no additional approval or claimed award.
8. Optional: call `claim_demo_award(case_id)` to confirm expected `No unclaimed approved award` rollback; check balance unchanged. Never interpret an expected rollback as a successful write.
9. Do not spam `resolve_claim`; retry only after **600 seconds** if further independent proof is available. Automatic settlement is NOT the purpose of an unavailable-evidence case.

If already noon or a wallet C is not controlled by the user: **do not attempt Path A**. Program #2 cannot be extended or reused by A or B.

## Path B — Program #1 after 15:00 ICT October 22 (preferred fallback)

Program #1 **already exists** (the first `get_program(1)` read previously showed `AWAITING_INCIDENT_REPORT`). It has a precommitted synthetic incident window **14:00–15:00 ICT October 22** and claim deadline **14:00 ICT October 23**. Same contract.

1. After **15:00 ICT Oct 22**, issuer wallet A must publish a clearly labeled *synthetic-only* immutable report to `evidence/demo_program_01_report.txt`. It must honestly describe the scenario and affirm that no exploit or financial loss is being alleged. Only publish and pin **after** the configured window. Compute exact UTF-8 SHA256, commit on GitHub, and pin the raw URL to that exact Git commit. Do **not** invent a URL or SHA.
2. With wallet A call `attach_report(1, pinned_raw_url, verified_sha256)` before the Program #1 claim deadline. Confirm `get_program(1).status=OPEN_FOR_CLAIMS` and report fields match.
3. With wallet B (which has NOT submitted to Program #1), call `submit_claim(1, "0x0000000000000000000000000000000000000000000000000000000000000001")` **before 14:00 ICT Oct 23**.
4. Call `resolve_claim(new_case_id)`, then check `get_case` remains `SUBMITTED`, outcome `UNVERIFIABLE`, awarded credits 0, no digest. Preserve the original validator traces.
5. If the case remains unresolved beyond **2026-10-30 14:00 ICT**, a separate `close_unverifiable_claim(case_id)` call may legitimately move it to `CLOSED_UNVERIFIABLE`. This is a closure, not an INELIGIBLE denial.

**Do not send any Sepolia ETH for the missing-evidence test.** The demo shows how unknown data is handled.

## Reviewer proof acceptance matrix

| Proof | Expected | Actual |
|---|---|---|
| Missing Blockscout receipt | HTTP 404 | PASS, [CI log](https://github.com/bearbaba/COVERDICT/actions/runs/39724254650) |
| Wallet C initial demo balance | `get_demo_balance(0x60Bfdf6315294c7856Acdc0B80D7Bd40217DEBff) = 0` | User-reported Studio read, October 22 (not independently fetched) |
| GenLayer submit transaction | FINALIZED + execution SUCCESS | Pending signature |
| `get_case(new_id)` before resolve | SUBMITTED / 0 attempts | Pending |
| `resolve_claim(new_id)` | Consensus Accepted + execution SUCCESS | Pending |
| GenLayer case outcome | UNVERIFIABLE; stays SUBMITTED | Pending |
| Evidence digest and credits | Empty digest; 0 award | Pending |
| Wallet's virtual balance | Unchanged | Pending |
| LLM leader and validator traces | Inspect independently | Pending |

## Contract nuance and source integrity

The deployed `_assess` currently wraps source fetch, SHA256 verification, JSON decode and receipt parsing in a general exception handler that returns `UNVERIFIABLE`. A missing tx hash that Blockscout returns as HTTP 404 therefore *should* reach UNVERIFIABLE if each GenVM node observes the same source. But source failures can differ between validators and may produce a non-finalized disputed transaction instead. **Only the actual Studio receipt determines the result.**

A separate experimental branch investigates a nondeterministic closure warning without silently modifying this deployed contract. `UNVERIFIABLE` results must not be marketed as false-claim detection, and SHA256 does not authenticate an issuer's claims.

See [NEGATIVE_STUDIO_TEST.md](NEGATIVE_STUDIO_TEST.md) and [ACCEPTANCE.md](ACCEPTANCE.md).
