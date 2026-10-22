# Studio Negative Acceptance — Program #2 (2026-10-22)

**LIVE NEGATIVE CASE #2 EXECUTED:** the claimant submitted the candidate and Studionet finalized an accepted-consensus `DENIED / INELIGIBLE` result. The checklist remains useful for reproducibility and open balance checks. The original contract and already-claimed Case #1 remain unchanged.

## Public independently checked source

GitHub Actions [read-only Blockscout discovery #39721696547](https://github.com/bearbaba/COVERDICT/actions/runs/39721696547) queried the actual `eth-sepolia.blockscout.com/api/v2/main-page/transactions` endpoint and then fetched the full individual transaction JSON with exactly the field schema consumed by `contracts/Coverdict.py`.

- **Sepolia tx:** [`0x51a7fe56dca8f0bc9bc883d0d0e59113df8160db924fac5de375dbdab20e2151`](https://eth-sepolia.blockscout.com/tx/0x51a7fe56dca8f0bc9bc883d0d0e59113df8160db924fac5de375dbdab20e2151)
- API: `https://eth-sepolia.blockscout.com/api/v2/transactions/0x51a7fe56dca8f0bc9bc883d0d0e59113df8160db924fac5de375dbdab20e2151`.
- Receipt status: `ok`, native value: `0` wei, timestamp: `2026-10-22T04:18:24Z` (11:18:24 ICT).
- Actual sender: `0xA360Cb036822c059eB9f03C2d4f48a94E5Fd9eD5`.
- Actual recipient: `0x31E88F54F8AFe3b38D362a65F5fc7083E162b980`.
- Eligible incident window under Program #2: `2026-10-22T02:20:00Z` through `02:30:00Z` (09:20–09:30 ICT).
- Eligible recipient: `0xd6b8a3a5eb329410d9504784812b8569afa8c2af`.

This is deliberately **not** a transfer from wallet B, is **outside** the allowed window, sends **zero** native test-ETH, and has the **wrong recipient**. The contract's deterministic checks must reject it before the model evaluates a covered incident.

## GenLayer Studio execution (before 12:00 ICT claim deadline)

Use [deployed COVERDICT Studio import](https://studio.genlayer.com/?import-contract=0x044DB5B1d148d30f8EdF591497d8726F66C22a16), chain **61999**, not Sepolia. No Sepolia transaction is required.

1. Connect a **different claimant wallet you control**, not the wallet that previously claimed Program #2. Suggested wallet B: `0xd6b8a3a5eb329410d9504784812b8569afa8c2af` **only if you control it** and can afford the usual Studionet transaction fee.
2. Read `get_program(2)` and confirm `status = OPEN_FOR_CLAIMS`, `submitted < max_claims`, local time before **2026-10-22 12:00 ICT**. If any check fails, do **not** submit; create a new separate test program instead.
3. Call `submit_claim(program_id=2, tx_hash="0x51a7fe56dca8f0bc9bc883d0d0e59113df8160db924fac5de375dbdab20e2151")`. Capture transaction hash, require execution SUCCESS and FINALIZED.
4. Read `get_case_count()` and the newly returned case ID. It is **expected to be 2** if no additional claims were added; never assume ID #2 without reading it.
5. Read `get_case(case_id)`, expecting `status=SUBMITTED`, wallet B as claimant, and the specified Sepolia tx.
6. Call `resolve_claim(case_id)` (any GenLayer wallet with fee balance), capture original transaction hash and all available consensus leader/validator evidence. Check **execution SUCCESS**, not only consensus ACCEPTED.
7. Read `get_case(case_id)` and `get_program(2)`, expecting `status=DENIED`, `outcome=INELIGIBLE`, `award_credits=0`, `claimed=false`, evidence_digest 64 characters, `attempts=1`, `approved` still `1`, `claimed` still `1`. Program `submitted` increases by one.
8. Read `get_demo_balance(wallet B)` before and after — must be **unchanged**. Intentionally call `claim_demo_award(case_id)` from B to test rollback `No unclaimed approved award`. Again require the balance not to change.

A failure to reach consensus, source API outage or verdict `UNVERIFIABLE` is **not** a successful DENIED test. If that happens save exact reason and traces; don't force/rewrite a result.

## Separate UNVERIFIABLE test (future program / distinct wallet)

Use a *syntactically valid* but nonexistent Sepolia hash on a separate program and/or a different wallet to exercise Blockscout 404, malformed API fields, or immutable source digest mismatch. Do not use a malformed `tx_hash` (would fail `submit_claim` before adjudication). Expected contract state after `resolve_claim`: `SUBMITTED` with `outcome=UNVERIFIABLE`, `evidence_digest=''`, `award_credits=0`; it remains retryable after 600 seconds, and may be closed 7 days after claim deadline with `CLOSED_UNVERIFIABLE`. Avoid treating missing proof as fraud.

**No actual economic loss or insurance benefits are established by this test.** See [ACCEPTANCE.md](ACCEPTANCE.md) and [ROADMAP.md](ROADMAP.md).


## Live INELIGIBLE claim #2 — 2026-10-22

- **User-supplied Studio on-chain state, before resolution:** `get_case(2)` returned `SUBMITTED`, `attempts=0`, claimant `0xd6b8a3a5eb329410d9504784812b8569afa8c2af`, Program `2` and Sepolia hash `0x51a7fe56dca8f0bc9bc883d0d0e59113df8160db924fac5de375dbdab20e2151`.
- **Live resolution transaction:** [`0x08dc22aca05271cbf270b1362248d89b95f52b06cbb040aac56d69c9011ba50a`](https://explorer-studio.genlayer.com/tx/0x08dc22aca05271cbf270b1362248d89b95f52b06cbb040aac56d69c9011ba50a). Explorer reported `FINALIZED`, `GenVM Execution SUCCESS`, return `"DENIED"`, `Normal` execution mode, consensus `Accepted`, zero rotations, **5 initial validators**. Individual validator vote details were not supplied.
- **After resolution:** `get_case(2)` returned `status=DENIED`, `outcome=INELIGIBLE`, `attempts=1`, `claimed=false`, `award_credits=0`, `last_attempt_at=1792643151`, `evidence_digest=8e81c418b1a6667af55310885e59bae29020f1d5f77a2a00ed6437002f63ac2a`.
- **Reason:** Receipt does not match wallet, destination, time window, successful status or native ETH value.
- **Equivalence Principle Output 0:** `outcome=INELIGIBLE`, identical digest and reason. This is a deterministic receipt-validation rejection (not a contested AI document-classification example).
- **GenVM stderr warning:** `Detected pickling storage class. Reading storage in nondet mode is not supported`. The actual transaction executed successfully, but this warning warrants a separate developer inspection.
- **Still pending:** submission tx hash for Case #2, full individual validator traces, wallet B balance before/after, denied-award rollback, original positive Case #1 resolve trace, and a live UNVERIFIABLE case. No real DeFi loss was proven.

### Independent read-only chain re-verification (GitHub Actions)

On 2026-10-22 GitHub Actions [stable Studionet RPC smoke](https://github.com/bearbaba/COVERDICT/actions/runs/39722933135) independently queried the unchanged contract through GenLayerJS 1.1.8 with **no wallet or signing**. The job completed **SUCCESS** and logged:

- `get_program_count=2`, `get_case_count=2`.
- `get_case(1)=CLAIMED / ELIGIBLE`; wallet A credits **100**.
- `get_case(2)=DENIED / INELIGIBLE`, credits authorized **0**, `claimed=false`, matching the exact Sepolia hash and evidence digest.
- Wallet B's demo-credit ledger **0**.
- `get_program(2)`: **submitted=2, approved=1, claimed=1**. The rejected case increased submissions without increasing approvals or awards.

This confirms the persisted negative decision and zero award independent of the user's screenshots. It does not prove the source incident is authentic, and individual validator votes for the negative adjudication were not supplied.

## Case #2: award rejection finalized

The user supplied transaction [0xb7eb2f6d...a1ce1](https://explorer-studio.genlayer.com/tx/0xb7eb2f6d36b2f185092a4cae788897e8e16ddef97fa83d7490649e40675a1ce1) after calling `claim_demo_award(2)` from wallet B. Status FINALIZED; execution ERROR with `[rollback] No unclaimed approved award`; consensus ACCEPTED, with five validator rows agreeing (GPT-5.4, MiniMax, Claude Sonnet 4.6, GLM, Qwen). This is an expected negative-test PASS. A post-revert read of wallet B credits is still pending; before the transaction wallet B had 0 credits. This rollback does not attest to the original AI verdict.

**Post-rollback independent verification:** [GitHub Actions live Studionet read](https://github.com/bearbaba/COVERDICT/actions/runs/39723617444) completed SUCCESS after the failed second award attempt; `get_demo_balance(wallet B)=0`, `get_case(2)=DENIED / INELIGIBLE / 0 credits`, Program #2 submitted/approved/claimed=`2/1/1`, and wallet A credits=`100`. Thus, the denied-award rollback did not credit wallet B. Individual vote traces for the original `resolve_claim(2)` remain unprovided.
