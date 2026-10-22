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

1. Save the **original successful** `resolve_claim(1)` transaction hash and leader/validator trace proving the AI decision, not only the negative replay trace.
2. Save `attach_report(2)`, `submit_claim(2,...)`, and `claim_demo_award(1)` transaction receipts. Inspect execution SUCCESS and FINALIZED status, not merely ACCEPTED consensus.
3. Run at least one **real negative test**: wrong sender/destination/time leads to INELIGIBLE if independently verifiable; missing or conflicting source remains UNVERIFIABLE. No claimed demo credits should be minted. A real negative Sepolia receipt has now been checked [in CI](https://github.com/bearbaba/COVERDICT/actions/runs/39721696547); [Studio test instructions](NEGATIVE_STUDIO_TEST.md) are prepared, **GenLayer Case #2 DENIED / INELIGIBLE is now confirmed live, with execution SUCCESS, consensus Accepted and an independently verified zero-credit result**.
4. Deploy and inspect an HTTPS app with live chain reads, public claim browsing, signed wallet flows, source links and receipt history. Verify two different wallets and a clean browser.
5. Confirm deploy/source parity and current GenLayer docs/SDK compatibility. Independent security review is still mandatory for real assets.

## Production guardrails

Current scope is only issuer-defined, self-authored simulated policy/report plus one Sepolia Blockscout endpoint. SHA256 pins the documents' bytes but does not prove their truth; 5 agreeing validators on rollback do not validate the original positive AI reasoning. A future production product requires independent incident authorities, loss accounting, objective asset ownership proofs, fraud/duplicate protections across chains, appeals, bounded payouts, legal review and contract audit.

Do not claim **Mainnet readiness**, sell any coverage, call the award insurance, or use real ETH in demonstrations. Read [SECURITY.md](SECURITY.md) and [ROADMAP.md](ROADMAP.md).

- Case #2 denied-award retry: [GenLayer transaction](https://explorer-studio.genlayer.com/tx/0xb7eb2f6d36b2f185092a4cae788897e8e16ddef97fa83d7490649e40675a1ce1) FINALIZED, expected ERROR rollback, consensus ACCEPTED with five agreeing validators. See [negative acceptance](NEGATIVE_STUDIO_TEST.md). Wallet B post-retry balance to be checked independently.
