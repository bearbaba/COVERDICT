## Case #1 original positive adjudication — FINALIZED consensus (October 22, 2026)

The user provided the [original `resolve_claim(1)` Studio receipt](https://explorer-studio.genlayer.com/tx/0x7f577cf22801b6d12b84ad820381817c8e42e5252518b6b4d553865dc68909f5): hash `0x7f577cf22801b6d12b84ad820381817c8e42e5252518b6b4d553865dc68909f5`, wallet A `0x4C7cb73aC8F8999af21cfc9fF4cF2333a9508Dcb`, deployed contract `0x044DB5B1d148d30f8EdF591497d8726F66C22a16`, October 22, 2026 **09:39:05 ICT**, Normal mode.

- **FINALIZED**, GenVM **Execution SUCCESS**, return `"APPROVED"`, **Consensus Accepted**, initial validators **5**, rotations **0**.
- Equivalence Principle Output 0: `outcome="ELIGIBLE"`, `digest="1425cb02fcf2e538a897b3ae4138a15b3542ddddad2e6f83761b121a31dab3a7"`.
- Output reason: verified successful, positive-value direct **Sepolia test-ETH** transfer from claimant to the exact recipient during **02:20–02:30 UTC**, and SHA256-pinned issuer-written synthetic policy/report explicitly covering that simulated incident class with no exclusions or conflicts.
- Subsequent independent [live Studionet RPC smoke](https://github.com/bearbaba/COVERDICT/actions/runs/39733970516) confirms `get_case(1)=CLAIMED / ELIGIBLE` and wallet A balance **100 nonredeemable demo credits**. This is a synthetic demo award, not evidence of DeFi exploit loss or a real insurance payout.
- **Known GenVM warning, nonfatal on this transaction:** `Detected pickling storage class. Reading storage in nondet mode is not supported`. A separate [draft PR #6](https://github.com/bearbaba/COVERDICT/pull/6) explores refactoring but is **not deployed**; investigate/test on a separately deployed new contract before merging to avoid source-parity confusion.
- The user-supplied excerpt includes five **initial** validators, consensus Accepted, and one equivalence output. It **does not include individual validator votes/traces**, so do not claim all five independently voted Agree on this AI judgment. Its human-authored incident report is issuer-controlled; SHA256 protects the exact bytes, not their factual authority.

## Verified Case #3 resolution execution — October 22, 2026, 13:17:48 ICT

**Case #3 has a user-supplied original adjudication transaction receipt:** [`resolve_claim(3)`, `0xa0c07abcc1742178c03b53342ea44a3c54d049f1864fc1f2b7e5a834cb9df4ab`](https://explorer-studio.genlayer.com/tx/0xa0c07abcc1742178c03b53342ea44a3c54d049f1864fc1f2b7e5a834cb9df4ab), from wallet C `0x60Bfdf6315294c7856Acdc0B80D7Bd40217DEBff` to the deployed COVERDICT contract.

- **FINALIZED**; GenVM **Execution SUCCESS**, Return Value `"SUBMITTED"`; **Consensus Accepted**, Normal mode, zero rotations, **five initial validators**.
- Equivalence Principle Output 0: `{"digest":"","outcome":"UNVERIFIABLE","reason":"One or more pinned evidence sources could not be independently verified."}`.
- Original user-provided post-resolution `get_case(3)`: `status=SUBMITTED`, `outcome=UNVERIFIABLE`, `attempts=1`, `evidence_digest=""`, `award_credits=0`, `claimed=false`. The [independent read-only RPC test](https://github.com/bearbaba/COVERDICT/actions/runs/39733970516) confirmed the persisted verdict and wallet C **0 credits**; Program #3 submitted/approved/claimed = **1/0/0**.
- GenVM stderr showed a **nonfatal warning**: `Detected pickling storage class. Reading storage in nondet mode is not supported`. This needs reproduction in an isolated new contract; see [experimental draft PR #6](https://github.com/bearbaba/COVERDICT/pull/6). The existing deployed contract has not been replaced.
- **Do not state that five validators independently agreed on a disputed AI narrative.** The user-provided summary shows five initial validators and Accepted consensus, but does not include their individual votes. This test validates fail-closed handling of missing receipt evidence, **not** the correctness of AI coverage decisions or proof of real DeFi loss.
- **Still missing:** the original Case #3 `submit_claim` transaction hash, per-validator trace for this resolution, and individual positive Case #1 validator votes; the original Case #1 FINALIZED adjudication transaction is linked above. Nothing was transferred or awarded in this negative-evidence test.

## Latest on-chain acceptance — Case #3: UNVERIFIABLE (2026-10-22)

**Live verdict observed from user-provided Studio state: PASS.** The user supplied a finalized state read of `get_case(3)`: `status=SUBMITTED`, `outcome=UNVERIFIABLE`, `attempts=1`, `last_attempt_at=1792649868`, `award_credits=0`, `claimed=false`, `evidence_digest=""`. The claimant is wallet C `0x60bfdf6315294c7856acdc0b80d7bd40217debff`, under Program #3, using the deliberately absent Sepolia hash `0x0000000000000000000000000000000000000000000000000000000000000001`. Reason: `One or more pinned evidence sources could not be independently verified.`

The missing Sepolia receipt previously returned HTTP 404 in a [read-only Blockscout API test](https://github.com/bearbaba/COVERDICT/actions/runs/39724530282). Unknown proof was **not** converted to `DENIED` or `APPROVED`; the case remains retryable after the contract's 600-second cooldown and carries no authorized demo award.

**Evidence boundary:** the original `submit_claim(3)` transaction hash and individual validator votes have **not yet been provided**; the `resolve_claim(3)` FINALIZED/SUCCESS receipt is now linked in the verified execution section. A state read is not the same as a finalized execution receipt. [Independent read-only RPC acceptance](https://github.com/bearbaba/COVERDICT/actions/runs/39733374513) now confirms wallet C's **post-resolution demo balance is still 0**, `get_case(3)=SUBMITTED / UNVERIFIABLE` with 0 authorized award, and Program #3 counters `submitted=1`, `approved=0`, `claimed=0`.

Sections below preserve historical milestones and planned steps; use this latest status rather than any older statement saying Case #3 is pending.

# COVERDICT — Evidence-based acceptance status (2026-10-22)

**Status: LIVE STUDIONET SYNTHETIC CLAIM FLOW DEMONSTRATED, NOT MAINNET SAFE.** This page deliberately separates user-provided on-chain state reads from independently inspected receipts. Credits have no value and cannot be redeemed.

## System and public sources

- **Contract:** [0x044DB5B1d148d30f8EdF591497d8726F66C22a16](https://studio.genlayer.com/?import-contract=0x044DB5B1d148d30f8EdF591497d8726F66C22a16) on GenLayer Studionet. [Deployment transaction](https://explorer-studio.genlayer.com/tx/0xf2d167a4c30bac322dcfeb2145cc157380a015fe043cfecbd82a150498afe045).
- **Program #2 creation:** [GenLayer transaction](https://explorer-studio.genlayer.com/tx/0x3742313c03a2ef541e961ef642874e5e34c5becd3501b5c2276f9c7e9429e46a).
- **Testnet receipt:** [Sepolia transaction](https://sepolia.etherscan.io/tx/0xb7e186434d67e72c8e42c8eac3a60a3a45be7b5391245fb3668fe3ade125143a). The user provided Etherscan data: Success, block 11966554, from 0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb to 0xd6b8a3a5eb329410d9504784812b8569afa8c2af, 0.001 faucet test-ETH.
- **Precommitted [policy](evidence/demo_program_02_policy.txt):** Git SHA `8dcbe358fcecb9c2a020428fda002df4f7dac20e`, exact SHA256 `3aecb23e16be10a42f929442ee928850c653a170da3d8aace136e38b579183bc`.
- **Post-window synthetic [incident report](evidence/demo_program_02_report.txt):** Git SHA `ccd7c2c7123c755c8839ef6957e918c4e25877b3`, SHA256 `6bf4d0b0ff74a2d2dbc9dec8ed4e97c3ac072962e960f68da412af9807815261`.

## On-chain state snapshots, supplied through accepted Studio reads

| Step | Observed state | Verification |
| --- | --- | --- |
| Fresh contract | `get_program_count()=0`, `get_case_count()=0` | User reported Accepted reads |
| Program #2 | `id=2`, `OPEN_FOR_CLAIMS`, pinned policy and report digests | User-provided `get_program(2)` |
| Claim #1 | `SUBMITTED`, claimant and Sepolia tx matched submitted inputs | User-provided `get_case(1)` |
| AI adjudication | `ELIGIBLE` + `APPROVED`, `attempts=1`, evidence digest `1425cb02fcf2e538a897b3ae4138a15b3542ddddad2e6f83761b121a31dab3a7` | User-provided post-`resolve_claim(1)` read |
| Award | `CLAIMED`, `claimed=true`, 100 nonredeemable virtual credits | User-provided post-`claim_demo_award(1)` read |
| Balance | `get_demo_balance(claimant)=100` | User-provided Accepted read |
| Program totals | `submitted=1,approved=1,claimed=1` | User-provided Accepted read |
| Duplicate award attempt | **ACCEPTED consensus / ERROR execution**, `[rollback] No unclaimed approved award`; five validator rows `Agree` | [GenLayer tx](https://explorer-studio.genlayer.com/tx/0x94c2b63fc97456a6cae8c6a847d471102eb63cd95dd82d2cd58657a5ef611082), user-provided consensus history |
| Balance after rejected repeat | Still **100 credits**, not 200 | Subsequent user read |

**Interpretation:** The first successful wallet-bound demo award and the failed replay are observed from contract reads and the supplied negative execution log. This is **not** evidence that a DeFi exploit or economic loss occurred, nor a claim that all claim types pass.

## Public site (first deployment)

- Vercel Git integration deployed `main` as Vite build to [https://coverdict-testnet.vercel.app](https://coverdict-testnet.vercel.app); Vercel state `READY` for deployment `dpl_3yPszcPpNKwcnYUPPdFCMwSV7irT`.
- Vercel project reports disabled SSO/password protection and a verified canonical domain.
- **Not independently browser-validated**: wallet flows, on-page chain reads, Chrome/Firefox browser access and mobile layout still require manual confirmation. Do not describe this as a completed live user acceptance test.

## Still needed before a strong GenLayer Projects submission

1. **Original positive adjudication receipt: PASS.** [`resolve_claim(1)` FINALIZED/SUCCESS](https://explorer-studio.genlayer.com/tx/0x7f577cf22801b6d12b84ad820381817c8e42e5252518b6b4d553865dc68909f5) returns `APPROVED`, Equivalence Principle `ELIGIBLE` with pinned digest. **Still pending:** individual leader/validator traces demonstrating how participants reached their votes, not merely the initial-validator count. For the separate inconclusive branch, a syntactically valid missing Sepolia hash returned HTTP 404 in [CI](https://github.com/bearbaba/COVERDICT/actions/runs/39724530282), and the live GenLayer UNVERIFIABLE verdict is **now executed successfully and FINALIZED**; see [Studio plan](UNVERIFIABLE_STUDIO_TEST.md).
2. Save `attach_report(2)`, `submit_claim(2,...)`, and `claim_demo_award(1)` transaction receipts. Inspect execution SUCCESS and FINALIZED status, not merely ACCEPTED consensus.
3. Run at least one **real negative test**: wrong sender/destination/time leads to INELIGIBLE if independently verifiable; missing or conflicting source remains UNVERIFIABLE. No claimed demo credits should be minted. A real negative Sepolia receipt has now been checked [in CI](https://github.com/bearbaba/COVERDICT/actions/runs/39721696547); [Studio test instructions](NEGATIVE_STUDIO_TEST.md) are prepared, **GenLayer Case #2 DENIED / INELIGIBLE is now confirmed live, with execution SUCCESS, consensus Accepted and an independently verified zero-credit result**.
4. Deploy and inspect an HTTPS app with live chain reads, public claim browsing, signed wallet flows, source links and receipt history. Verify two different wallets and a clean browser.
5. Confirm deploy/source parity and current GenLayer docs/SDK compatibility. Independent security review is still mandatory for real assets.

## Production guardrails

Current scope is only issuer-defined, self-authored simulated policy/report plus one Sepolia Blockscout endpoint. SHA256 pins the documents' bytes but does not prove their truth; 5 agreeing validators on rollback do not validate the original positive AI reasoning. A future production product requires independent incident authorities, loss accounting, objective asset ownership proofs, fraud/duplicate protections across chains, appeals, bounded payouts, legal review and contract audit.

Do not claim **Mainnet readiness**, sell any coverage, call the award insurance, or use real ETH in demonstrations. Read [SECURITY.md](SECURITY.md) and [ROADMAP.md](ROADMAP.md).

- Case #2 denied-award retry: [GenLayer transaction](https://explorer-studio.genlayer.com/tx/0xb7eb2f6d36b2f185092a4cae788897e8e16ddef97fa83d7490649e40675a1ce1) FINALIZED, expected ERROR rollback, consensus ACCEPTED with five agreeing validators. See [negative acceptance](NEGATIVE_STUDIO_TEST.md). Wallet B post-retry balance to be checked independently.

**Post-rollback independent verification:** [GitHub Actions live Studionet read](https://github.com/bearbaba/COVERDICT/actions/runs/39723617444) completed SUCCESS after the failed second award attempt; `get_demo_balance(wallet B)=0`, `get_case(2)=DENIED / INELIGIBLE / 0 credits`, Program #2 submitted/approved/claimed=`2/1/1`, and wallet A credits=`100`. Thus, the denied-award rollback did not credit wallet B. Individual vote traces for the original `resolve_claim(2)` remain unprovided.

**Program #3 precommitted and created (2026-10-22):** [FINALIZED, GenVM SUCCESS, consensus Accepted `create_program` transaction](https://explorer-studio.genlayer.com/tx/0x7686990d2f1cd1e8368d393c1f35406b2d73f8cb29f2d5fd5ed18ef074be2300) returned ID **3** at 12:20:28 ICT. User's `get_program(3)` matches commit-pinned policy SHA256 `48be0cec000526461ee631009b93023a5fe3fe3b29150bd4126c873a7eda2a54`, records issuer wallet A, 12:45–12:47 ICT incident, 13:30 ICT claim deadline, and zero submissions/awards. The report is NOT yet attached and the UNVERIFIABLE decision is NOT yet executed. Follow [PROGRAM_03.md](PROGRAM_03.md) after 12:47; wallet C is `0x60Bfdf6315294c7856Acdc0B80D7Bd40217DEBff` (reported initial credits 0).

### Confirmed independent Case #3 RPC result

[GitHub Actions #39733374513](https://github.com/bearbaba/COVERDICT/actions/runs/39733374513) independently read the live Studionet contract after Case #3 resolved: program count 3, claim count 3; Program #3 submitted 1, approved 0; `get_case(3)=SUBMITTED / UNVERIFIABLE` with award 0; wallet C balance **0**; wallets A/B **100 / 0**. The job passed. This establishes persisted state and no demo-credit award. The original resolution transaction receipt is now linked above; individual validator votes remain pending.
