# COVERDICT V2 Program #2 — actual 19:30–19:40 ICT signed program


## V2 negative acceptance — duplicate demo award rejected (October 22, 2026)

**User-provided GenLayer Studio screenshot** records the *second* `claim_demo_award(1)` attempt on V2: [transaction `0xae369845bd8562dceea37b7d8dda27fe0a882246db5c81a4318728a9ef586ce3`](https://explorer-studio.genlayer.com/tx/0xae369845bd8562dceea37b7d8dda27fe0a882246db5c81a4318728a9ef586ce3). The detail panel displays **Execution Status: ACCEPTED; Result: ERROR**, method `claim_demo_award`, `args=[1]`, output `None`, with **five listed validators** showing `ERROR` and `Agree`, each reporting `[rollback] No unclaimed approved award`. This is the expected access/state guard on an already-claimed case, not an extra award or successful execution. A consensus agreement with a rollback is **not** an approved claim verdict.

**Verification limits:** the screenshot shows `ACCEPTED` rather than independently established `FINALIZED` for this failed transaction. Fresh post-attempt reads of `get_case(1)`, `get_demo_balance(B)` and `get_program(2)` are still needed to independently close the *no additional credit* invariant. Previously confirmed immediately after the first successful award: `get_case(1)=CLAIMED`, `get_demo_balance(B)=100`, counters `1/1/1`. Replay must preserve all three. Do not imply any real compensation or insurance.



## V2 positive claim end-to-end complete — October 22, 2026

**User-provided post-award on-chain read: PASS.** `get_case(1)` on V2 now returns `status=CLAIMED`, `claimed=true`, `outcome=ELIGIBLE`, `award_credits=100`, `attempts=1` and the same immutable evidence digest `ea9d415a876825515f1ce08d3c39b1f841345a16ce4a7e6ab7151693b68a4ba7`. The claimant wallet B `0xd6b8a3a5eb329410d9504784812b8569afa8c2af` separately read `get_demo_balance(B)=100` (Accepted), and `get_program(2)` reports `submitted=1`, `approved=1`, `claimed=1`, `report_attested=true`. The stored state confirms a completed synthetic award lifecycle, not financial compensation.

**Still to capture:** original successful `claim_demo_award(1)` transaction hash/GenVM receipt; separate `attach_report` and `attest_report` write transaction hashes; individual validator traces from the `resolve_claim` transaction. No repeated award attempt on V2 has been verified. One successful V2 resolution showed empty stderr, but general elimination of the earlier GenVM warning remains unproven. V2 is not audited or mainnet-ready.

## V2 live positive adjudication — October 22, 2026

**User-supplied transaction details of [`resolve_claim(1)`](https://explorer-studio.genlayer.com/tx/0xa38a935a081667c9d88d5692a84cdfc426eda164df0e7788e2c567bcfb275ad7): FINALIZED / GenVM Execution SUCCESS / Consensus Accepted, at 19:58:31 ICT.** Caller wallet B `0xd6b8a3a5eb329410d9504784812b8569afa8c2af`, contract `0x844BE9205a755900B7a6E40596DeDbdC69825e63`, mode Normal (Full Consensus), initial validators 5, rotation count **1**, stdout/stderr empty, return value `APPROVED`.

- Equivalence output: `outcome=ELIGIBLE`; evidence digest `ea9d415a876825515f1ce08d3c39b1f841345a16ce4a7e6ab7151693b68a4ba7`.
- User-provided prior `get_case(1)` confirmed a real on-chain submission: Program #2, claimant B, status `SUBMITTED`, attempts 0, and Sepolia tx `0x7e24af7f845356332d300471cdbb70584ddea7568538e638aa438daec93ead9f`.
- Verdict reason states that the independently fetched Sepolia receipt satisfied wallet, recipient, positive native ETH value, status, and the immutable **19:30–19:40 ICT** block-time window; both report and policy matched the locked parameters, and the distinct attestor's SHA256 confirmation was present.
- **GenVM warning checkpoint:** unlike V1, this first successful V2 `resolve_claim` receipt has empty stderr; the earlier `Detected pickling storage class` warning was **not observed in this run**. This does not prove the warning cannot occur for other V2 claims; repeat adversarial/runtime checks.
- **Pre-award checkpoint:** After the successful Full Consensus transaction, user read `get_case(1)` with `status=APPROVED`, `outcome=ELIGIBLE`, `attempts=1`, `award_credits=100`, `claimed=false`. **This was subsequently superseded by the CLAIMED/100-credit post-award read above.**
- The five **initial** validators and one rotation are transaction metadata; individual validator vote or reasoning traces were **not** included in this shared receipt. The explorer has not been independently accessed here. No real incident, insurance compensation, or financial loss is established by this synthetic test.


## Post-window synthetic report — GitHub-pinned 2026-10-22 after 19:40 ICT

- **Report GitHub-pinned; subsequently on-chain attached and attested.** User-provided `get_program(2)` confirmed `OPEN_FOR_CLAIMS`, `report_attested=true`, `attested_at=1792673488`, and matching report URL / SHA256. The original write transaction hashes for `attach_report` and successful `attest_report` are still not recorded.
- Immutable report commit: `8b3df9673258fefc40b0a04ed387ce54091cb041`.
- [Pinned report](https://github.com/bearbaba/COVERDICT/blob/8b3df9673258fefc40b0a04ed387ce54091cb041/evidence/v2_program_02_report.txt).
- Raw report URL: `https://raw.githubusercontent.com/bearbaba/COVERDICT/8b3df9673258fefc40b0a04ed387ce54091cb041/evidence/v2_program_02_report.txt`.
- Exact 2,377-byte ASCII/UTF-8 file (trailing LF) SHA256: `fc6b84e341cdd365658fef4c0abe42b4e0e42c605e6e24cbe51c055fce477170`. The local Git blob SHA-1 matches the blob returned after GitHub creation.
- **Observed:** user-provided `get_program(2)` progressed through `AWAITING_ATTESTATION` to `OPEN_FOR_CLAIMS`, `report_attested=true`; wallet C attestor authorization was required. A failed unauthorized `attest_report` call rolled back as designed.
- Submitted claimant receipt candidate: `0x7e24af7f845356332d300471cdbb70584ddea7568538e638aa438daec93ead9f` on Sepolia; wallet B to wallet A, success according to user Etherscan excerpt. Block timestamp and the exact native value returned by Blockscout remain unverified from this environment. These receipt facts must be independently evaluated by GenLayer consensus; the issuer-authored synthetic report does not certify receipt validity, actual loss, or any compensation right.


**Status:** `create_program(…)` was signed at **October 22, 2026, 18:25:19 ICT**, and returned program ID **2**, `FINALIZED`, GenVM `SUCCESS`, Consensus `Accepted`, Normal mode, zero rotations, five initial validators. Independent live read-only RPC verification is tracked by `web/scripts/studionet-v2-smoke.mjs`.

**CRITICAL: Program #2 is NOT the subsequently requested 18:45–18:55 configuration.** Although an updated draft policy for 18:45 was committed to GitHub, the actual on-chain transaction used the **earlier, commit-pinned 19:30–19:40 configuration**. The on-chain precommit is immutable, cannot be changed, and prevails over any documentation or conversational intention. **Do not use a Sepolia transfer made during 18:45–18:55 as positive proof in Program #2.**

## Immutable on-chain evidence

- [Original `create_program` transaction, FINALIZED/SUCCESS](https://explorer-studio.genlayer.com/tx/0x0f8ff8869ee0f392887ee4734ebaacfb8a6a99a3a49e7278099359d3c2e0af41), full hash `0x0f8ff8869ee0f392887ee4734ebaacfb8a6a99a3a49e7278099359d3c2e0af41`.
- V2 Studionet contract: `0x844BE9205a755900B7a6E40596DeDbdC69825e63`, chain ID `61999`.
- Issuer A `0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb`; separate designated attestor C `0x60bfdf6315294c7856acdc0b80d7bd40217debff`.
- Designated Sepolia recipient: issuer A address above.
- Candidate claimant B: `0xd6b8a3a5eb329410d9504784812b8569afa8c2af`. The attestor signature is only document endorsement, not independent factual loss proof.
- [ACTUAL pinned policy at commit `8165ba339606315fb2d53111524ad7e0d0478435`](https://github.com/bearbaba/COVERDICT/blob/8165ba339606315fb2d53111524ad7e0d0478435/evidence/v2_program_02_policy.txt), 2456 ASCII bytes; SHA256 `e45afdb4965286995263a86d9a2456745438f5747234f56a155b41e2c9eccf3a`.

| Exact `create_program` parameter | FINALIZED on-chain value |
|---|---|
| label | `V2 attested Sepolia synthetic receipt drill #2` |
| deposit_contract | `0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb` |
| incident_start | `1792672200` (**Oct 22, 19:30:00 ICT**) |
| incident_end | `1792672800` (**Oct 22, 19:40:00 ICT**) |
| claim_deadline | `1792839600` (**Oct 24, 18:00:00 ICT**) |
| policy_url | `https://raw.githubusercontent.com/bearbaba/COVERDICT/8165ba339606315fb2d53111524ad7e0d0478435/evidence/v2_program_02_policy.txt` |
| policy_sha256 | `e45afdb4965286995263a86d9a2456745438f5747234f56a155b41e2c9eccf3a` |
| award_credits | `100` |
| max_claims | `3` |
| attestor | `0x60bfdf6315294c7856acdc0b80d7bd40217debff` |

The original `get_program(2)` state should be `AWAITING_INCIDENT_REPORT` until the issuer actually attaches a matching post-window report. Do not claim report attachment or attestation happened without FINALIZED/SUCCESS write transactions and independent state reads.

## Actual Program #2: next phases

1. **October 22, 19:30–19:40 ICT:** claimant wallet B can send a *new*, small native Sepolia test-ETH transfer to A on Ethereum Sepolia `11155111`, but only if obtaining **ELIGIBLE** proof is desired. Check the **block timestamp**, not the UI submission time; allow several minutes of margin (e.g., 19:32–19:35). Never send Mainnet ETH or real-value assets.
2. **Only after 19:40 ICT:** commit a new, honestly dated synthetic report at `evidence/v2_program_02_report.txt`, for the immutable 19:30–19:40 window. Pin its SHA256 and source commit. **Do not use an 18:45 report or the Program #1 report.**
3. **Before October 24, 18:00 ICT:** issuer A calls `attach_report(2,report_url,report_sha256)`, expecting `AWAITING_ATTESTATION`; attestor C separately signs `attest_report(2,report_sha256)`, expecting `OPEN_FOR_CLAIMS`.
4. Claimant B submits `submit_claim(2,real_sepolia_tx_hash)` **before October 24 18:00 ICT**, captures actual Case ID, and later calls `resolve_claim(case_id)`. Resolve has an additional bounded review grace period. If APPROVED, B can claim 100 **nonredeemable demo credits** once.
5. Validate the first live V2 resolution in Normal/Full Consensus for `Execution SUCCESS`, expected output, **individual validator votes**, and whether the old nonfatal GenVM nondeterministic-storage warning has disappeared. Confirm final states and wallet credit balances by independent RPC.

**No real economic loss or insurance coverage is proven.** Separate wallet keys do not prove independent real-world authority; source text remains issuer-written and receipt checks rely on Sepolia explorer REST.

## Chronology and corrected instructions

- Program #1 was precommitted for 16:00–16:10, with an 18:00 claim deadline. An issuer `attach_report(1)` at 18:10:33 [failed with GenVM ERROR/Rollback](https://explorer-studio.genlayer.com/tx/0xa618ededb65dbcb0394aaf7af50b84744c26a93bee94310fe7463eacf3df39b8), despite `FINALIZED` and `Accepted`; it cannot be rescued or reopened.
- The first prepared Program #2 policy for **19:30–19:40** at `evidence/v2_program_02_policy.txt` was signed and created Program #2 on-chain.
- The later **18:45–18:55** artifact, `evidence/v2_program_02_policy_1845.txt` at commit `2648fbaa069670b2339db9e084b62ed933655793`, was **not used** in the FINALIZED Program #2 transaction. Preserve it as an unused historical draft and never present it as the effective on-chain policy. No separate 18:45 program has been confirmed.
- The existing [early Sepolia transfer](https://sepolia.etherscan.io/tx/0x9b9d33dfa1a9bcb3bd0a655290246020fdeed4a0df2d18aedc63e3aeb060d5ec) is outside the live 19:30–19:40 window. If its receipt independently verifies, it should be `INELIGIBLE` for Program #2, not `ELIGIBLE`.

Historical receipts are evidence; `FINALIZED` / `Accepted` alone does not mean GenVM `SUCCESS`.
