## Verified Case #3 resolution execution — October 22, 2026, 13:17:48 ICT

**Case #3 has a user-supplied original adjudication transaction receipt:** [`resolve_claim(3)`, `0xa0c07abcc1742178c03b53342ea44a3c54d049f1864fc1f2b7e5a834cb9df4ab`](https://explorer-studio.genlayer.com/tx/0xa0c07abcc1742178c03b53342ea44a3c54d049f1864fc1f2b7e5a834cb9df4ab), from wallet C `0x60Bfdf6315294c7856Acdc0B80D7Bd40217DEBff` to the deployed COVERDICT contract.

- **FINALIZED**; GenVM **Execution SUCCESS**, Return Value `"SUBMITTED"`; **Consensus Accepted**, Normal mode, zero rotations, **five initial validators**.
- Equivalence Principle Output 0: `{"digest":"","outcome":"UNVERIFIABLE","reason":"One or more pinned evidence sources could not be independently verified."}`.
- Original user-provided post-resolution `get_case(3)`: `status=SUBMITTED`, `outcome=UNVERIFIABLE`, `attempts=1`, `evidence_digest=""`, `award_credits=0`, `claimed=false`. The [independent read-only RPC test](https://github.com/bearbaba/COVERDICT/actions/runs/39733970516) confirmed the persisted verdict and wallet C **0 credits**; Program #3 submitted/approved/claimed = **1/0/0**.
- GenVM stderr showed a **nonfatal warning**: `Detected pickling storage class. Reading storage in nondet mode is not supported`. This needs reproduction in an isolated new contract; see [experimental draft PR #6](https://github.com/bearbaba/COVERDICT/pull/6). The existing deployed contract has not been replaced.
- **Do not state that five validators independently agreed on a disputed AI narrative.** The user-provided summary shows five initial validators and Accepted consensus, but does not include their individual votes. This test validates fail-closed handling of missing receipt evidence, **not** the correctness of AI coverage decisions or proof of real DeFi loss.
- **Still missing:** the original Case #3 `submit_claim` transaction hash, per-validator trace for this resolution, and original positive Case #1 adjudication transaction/validator trace. Nothing was transferred or awarded in this negative-evidence test.

## Latest on-chain acceptance — Case #3: UNVERIFIABLE (2026-10-22)

**Live verdict observed from user-provided Studio state: PASS.** The user supplied a finalized state read of `get_case(3)`: `status=SUBMITTED`, `outcome=UNVERIFIABLE`, `attempts=1`, `last_attempt_at=1792649868`, `award_credits=0`, `claimed=false`, `evidence_digest=""`. The claimant is wallet C `0x60bfdf6315294c7856acdc0b80d7bd40217debff`, under Program #3, using the deliberately absent Sepolia hash `0x0000000000000000000000000000000000000000000000000000000000000001`. Reason: `One or more pinned evidence sources could not be independently verified.`

The missing Sepolia receipt previously returned HTTP 404 in a [read-only Blockscout API test](https://github.com/bearbaba/COVERDICT/actions/runs/39724530282). Unknown proof was **not** converted to `DENIED` or `APPROVED`; the case remains retryable after the contract's 600-second cooldown and carries no authorized demo award.

**Evidence boundary:** the original `submit_claim(3)` transaction hash and individual validator votes have **not yet been provided**; the `resolve_claim(3)` FINALIZED/SUCCESS receipt is now linked in the verified execution section. A state read is not the same as a finalized execution receipt. [Independent read-only RPC acceptance](https://github.com/bearbaba/COVERDICT/actions/runs/39733374513) now confirms wallet C's **post-resolution demo balance is still 0**, `get_case(3)=SUBMITTED / UNVERIFIABLE` with 0 authorized award, and Program #3 counters `submitted=1`, `approved=0`, `claimed=0`.

Sections below preserve historical milestones and planned steps; use this latest status rather than any older statement saying Case #3 is pending.

# COVERDICT — GenLayer Projects acceptance evidence

**Current status: ONE POSITIVE DEMO AWARD, ONE DETERMINISTIC NEGATIVE DENIAL AND ONE LIVE UNVERIFIABLE CASE ON STUDIONET.** Claim #1 reached CLAIMED with 100 demo credits, Claim #2 returned `DENIED / INELIGIBLE` and zero award, backed by a [FINALIZED SUCCESS resolution transaction](https://explorer-studio.genlayer.com/tx/0x08dc22aca05271cbf270b1362248d89b95f52b06cbb040aac56d69c9011ba50a). Individual positive and negative validator vote traces, individual UNVERIFIABLE validator votes, browser E2E and source/deployment parity remain to verify; NOT Mainnet-ready.

## Concrete contested consequence

The dispute is **whether a wallet-specific transaction falls within an issuer's PRECOMMITTED synthetic reimbursement policy, given a reported incident**. A final `APPROVED` consensus outcome authorizes **only the matching claimant wallet** to mint its one-time fixed demo award; `DENIED` does not. `UNVERIFIABLE` does not substitute for proof of failure. No owner `force_approve` or editable verdict exists. No actual funds move.

Compared with a generic webpage classifier, the contract enforces wallet/transaction matching, immutable evidence policy, a bounded incident window, anti-replay and settlement authorization in code.

## Source policy

- Immutable policy and report are exact SHA256-checked files under a Git SHA, no branches, redirects assumed safe, arbitrary domains or query parameters.
- Receipt is constructed for the submitted Ethereum Sepolia testnet transaction hash using exactly one Ethereum Sepolia Blockscout REST API domain. Every validator refetches and checks objective facts before semantic judgment.
- `gl.vm.run_nondet_unsafe` validator independently reruns `self._assess`, and agrees only if both the verdict status and stable fingerprint match; no validator trusts only the output format.
- Unknown evidence leaves claim `SUBMITTED`; a new attempt is cooldown-limited. After 7 days beyond the program claim deadline, anyone can close an unresolved claim as `CLOSED_UNVERIFIABLE` without an award. This is not a denial of real-world loss.

## Submission gates

1. `python -m pytest -q tests/` and CI web build are green; run `genvm-lint check contracts/Coverdict.py` in matching GenLayer CLI release.
2. Deploy a NEW instance on stable **Studionet**, Normal (Full Consensus). Save exact contract address and FINALIZED+SUCCESS receipt.
3. Create a test program with policy **before** its incident start. Attach a test report after the window; prove issuer-only enforcement, SHA mismatch and fake URL rejection.
4. Obtain a **real Sepolia testnet direct native test-ETH transaction receipt** belonging to the claimant wallet, in the specified time/destination range. Do not fake or pretend financial loss. Do not use or send real ETH. Use only existing or deliberately prepared testnet receipts with faucet test-ETH, and disclose that transfers do not prove any exploit loss.
5. Run a resolvable report whose incident-type classification is meaningful and unambiguous. Show full leader/validator trace and final `APPROVED`/`DENIED` or `UNVERIFIABLE` state, including proof source/digest and reason.
6. Test claimant-only `claim_demo_award`, repeated award rejection, same tx reused, wrong wallet/destination and out-of-window proof. Capture full transaction hash for each state transition.
7. Deploy frontend to HTTPS, connect two wallets, confirm all visible data is live, and record an unedited walkthrough. The website MUST NOT present “insured” users or real loss as verified.
8. Correct trust boundaries or add an incident verification partner before any real payout Mainnet plan. If the steward requires a real-world loss proof rather than a simulated program, disclose the limitation and improve before submission.

## Explorer/website evidence

| Gate | State | Proof |
| --- | --- | --- |
| Source repo + contract | Started | `contracts/Coverdict.py` |
| CI | PASS on `fix/testnet-readiness` | [CI run](https://github.com/bearbaba/COVERDICT/actions/runs/39638135874) |
| GenVM lint | PASS in GitHub Actions | [CI run](https://github.com/bearbaba/COVERDICT/actions/runs/39638135874) |
| Studionet deployment | FINALIZED per user's Studio screenshot; source parity pending | [deployment receipt](https://explorer-studio.genlayer.com/tx/0xf2d167a4c30bac322dcfeb2145cc157380a015fe043cfecbd82a150498afe045) · [Studio import](https://studio.genlayer.com/?import-contract=0x044DB5B1d148d30f8EdF591497d8726F66C22a16) |
| Program #2 incident report | **OPEN_FOR_CLAIMS, pinned report** (user-provided on-chain read) | [Program #2 acceptance record](PROGRAM_02.md); report hash match, no write receipt supplied |
| Negative Case #2 live | **PASS — DENIED/INELIGIBLE**, no credits, GenVM SUCCESS + consensus Accepted; initial validator count 5, individual votes not provided | [resolve tx](https://explorer-studio.genlayer.com/tx/0x08dc22aca05271cbf270b1362248d89b95f52b06cbb040aac56d69c9011ba50a) · [test record](NEGATIVE_STUDIO_TEST.md) |
| AI leader/validator consensus | **Claim #1 APPROVED / ELIGIBLE (state read supplied); resolve receipt and validator traces pending** | [Program #2 case evidence](PROGRAM_02.md) |
| Program & case lifecycle | **Program #2 claim submitted, approved, and marked CLAIMED; user-provided state reads** | [Program #1](PROGRAM_01.md), [Program #2](PROGRAM_02.md); [Program #2 creation tx](https://explorer-studio.genlayer.com/tx/0x3742313c03a2ef541e961ef642874e5e34c5becd3501b5c2276f9c7e9429e46a) |
| Wallet award claim on-chain | **`get_case(1)`=CLAIMED; `get_demo_balance(wallet)`=100; Program #2 submitted/approved/claimed=1/1/1**. Successful award receipt pending; replay-negative PASS with 5 validator agrees and rollback | [Program #2 record](PROGRAM_02.md) |
| HTTPS testnet frontend | **Vercel Production READY**; anonymous browser/wallet E2E not yet checked | [Website](https://coverdict-testnet.vercel.app) · [deployment](https://vercel.com/khaiptk1998-8088s-projects/coverdict-testnet/3yPszcPpNKwcnYUPPdFCMwSV7irT) |

**Suggested category:** Dispute Resolution (not “AI & Agents” merely because an LLM is used). This is a full application effort; submit under Projects only after completing the real contract + frontend flow. The exact awards/points are decided by GenLayer stewards, not the repository.

## Actual deployment reference (2026-10-21)

- Address: `0x044DB5B1d148d30f8EdF591497d8726F66C22a16`
- Hash: `0xf2d167a4c30bac322dcfeb2145cc157380a015fe043cfecbd82a150498afe045`
- Screenshot: Normal (Full Consensus), contract methods available, `FINALIZED` status and deployed log. A final receipt and source match should still be checked in Explorer/Studio before asserting all contract code is identical to the branch.
- Immediate next check: `get_program_count()` and `get_case_count()` from the imported contract; expect both `0` for an unused instance. This is an **expected value, not a recorded read**.
- Do not publish any fabricated program/case/claim result or present test-ETH transfer as evidence of real DeFi loss.

### Replay protection — negative execution correctly rejected

- [Transaction 0x94c2b63fc97456a6cae8c6a847d471102eb63cd95dd82d2cd58657a5ef611082](https://explorer-studio.genlayer.com/tx/0x94c2b63fc97456a6cae8c6a847d471102eb63cd95dd82d2cd58657a5ef611082): `claim_demo_award(1)` executed after an approved award had already been claimed.
- Consensus reached **ACCEPTED** with five listed validator **Agree** results, while the execution ended in **ERROR / rollback**, `No unclaimed approved award`. This is the correct negative-test result, not a positive successful execution.
- **Post-rollback read confirmed by the user:** `get_demo_balance(claimant)` still returns `100` after the rejected replay. Replay protection and zero-change-on-revert are both PASS for this test case.
- Earlier accepted reads: claim state `CLAIMED`, demo balance `100`, program counters `submitted=approved=claimed=1`.
- **Still needed:** read balance after the failed replay, source-matched positive adjudication transaction + validator traces, a genuinely ineligible/unverifiable claim, HTTPS deployment and reviewable demo.


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

- Case #2 denied-award retry: [GenLayer transaction](https://explorer-studio.genlayer.com/tx/0xb7eb2f6d36b2f185092a4cae788897e8e16ddef97fa83d7490649e40675a1ce1) FINALIZED, expected ERROR rollback, consensus ACCEPTED with five agreeing validators. See [negative acceptance](NEGATIVE_STUDIO_TEST.md). Wallet B post-retry balance to be checked independently.

**Post-rollback independent verification:** [GitHub Actions live Studionet read](https://github.com/bearbaba/COVERDICT/actions/runs/39723617444) completed SUCCESS after the failed second award attempt; `get_demo_balance(wallet B)=0`, `get_case(2)=DENIED / INELIGIBLE / 0 credits`, Program #2 submitted/approved/claimed=`2/1/1`, and wallet A credits=`100`. Thus, the denied-award rollback did not credit wallet B. Individual vote traces for the original `resolve_claim(2)` remain unprovided.

**Program #3 precommitted and created (2026-10-22):** [FINALIZED, GenVM SUCCESS, consensus Accepted `create_program` transaction](https://explorer-studio.genlayer.com/tx/0x7686990d2f1cd1e8368d393c1f35406b2d73f8cb29f2d5fd5ed18ef074be2300) returned ID **3** at 12:20:28 ICT. User's `get_program(3)` matches commit-pinned policy SHA256 `48be0cec000526461ee631009b93023a5fe3fe3b29150bd4126c873a7eda2a54`, records issuer wallet A, 12:45–12:47 ICT incident, 13:30 ICT claim deadline, and zero submissions/awards. The report is NOT yet attached and the UNVERIFIABLE decision is NOT yet executed. Follow [PROGRAM_03.md](PROGRAM_03.md) after 12:47; wallet C is `0x60Bfdf6315294c7856Acdc0B80D7Bd40217DEBff` (reported initial credits 0).

### Confirmed independent Case #3 RPC result

[GitHub Actions #39733374513](https://github.com/bearbaba/COVERDICT/actions/runs/39733374513) independently read the live Studionet contract after Case #3 resolved: program count 3, claim count 3; Program #3 submitted 1, approved 0; `get_case(3)=SUBMITTED / UNVERIFIABLE` with award 0; wallet C balance **0**; wallets A/B **100 / 0**. The job passed. This establishes persisted state and no demo-credit award. The original resolution transaction receipt is now linked above; individual validator votes remain pending.
