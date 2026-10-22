# COVERDICT V2 Program #2 — actual 19:30–19:40 ICT signed program

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
