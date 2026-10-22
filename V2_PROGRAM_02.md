# COVERDICT V2 Program #2 — replacement for expired Program #1

> **TIME CHANGE (Oct 22, 2026): User selected 18:45–18:55 ICT. The previously prepared 19:30–19:40 policy `evidence/v2_program_02_policy.txt` is OBSOLETE for planned Program #2 and MUST NOT be used for a new 18:45 program.** The obsolete policy is preserved for audit; the signed program data and on-chain commitments cannot be edited. As of this update, Program #2 creation has not been verified. A successful FINALIZED + GenVM SUCCESS `create_program` transaction and `get_program(2)` must be checked.

## ACTIVE REPLACEMENT PARAMETERS — 18:45–18:55 ICT

- **Precommit the start before 18:30 ICT on Oct 22, 2026**, allowing time for finality; GenLayer requires at least 900 seconds of lead time. If missed, don't sign this configuration.
- Immutable policy: [`v2_program_02_policy_1845.txt`](https://github.com/bearbaba/COVERDICT/blob/2648fbaa069670b2339db9e084b62ed933655793/evidence/v2_program_02_policy_1845.txt)
- Pinned commit: `2648fbaa069670b2339db9e084b62ed933655793`
- Verified SHA256, exact 2529 ASCII bytes: `8450c4a2746b93370dec52c712f0954365fc4b97398eac920c743b41590b29f6`
- Contract: GenLayer Studionet **61999**, V2 `0x844BE9205a755900B7a6E40596DeDbdC69825e63`
- Issuer A: `0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb`
- Attestor C: `0x60bfdf6315294c7856acdc0b80d7bd40217debff`
- Candidate claimant B: `0xd6b8a3a5eb329410d9504784812b8569afa8c2af`

| create_program argument (exact order) | Value |
|---|---|
| label | `V2 attested Sepolia synthetic receipt drill #2` |
| deposit_contract | `0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb` |
| incident_start | `1792669500` (18:45 ICT, Oct 22) |
| incident_end | `1792670100` (18:55 ICT, Oct 22) |
| claim_deadline | `1792839600` (18:00 ICT, Oct 24) |
| policy_url | `https://raw.githubusercontent.com/bearbaba/COVERDICT/2648fbaa069670b2339db9e084b62ed933655793/evidence/v2_program_02_policy_1845.txt` |
| policy_sha256 | `8450c4a2746b93370dec52c712f0954365fc4b97398eac920c743b41590b29f6` |
| award_credits | `100` |
| max_claims | `3` |
| attestor | `0x60bfdf6315294c7856acdc0b80d7bd40217debff` |

**Sequence:** issuer A `create_program` now; between 18:45–18:55 send **new** Sepolia test-ETH B→A if seeking ELIGIBLE; only after 18:55 create/pin **new report matching 18:45–18:55**; issuer A `attach_report` then C `attest_report`; B `submit_claim` before Oct 24 18:00. The original Program #1 expired and cannot be reused. Do not commit a misleading post-window incident report ahead of the window.

---

## Historical superseded proposal — 19:30–19:40 (DO NOT USE)


**State: precommitted policy exists on GitHub; on-chain creation has NOT been signed or confirmed.** Experimental GenLayer Studionet only. No real financial payout, insurance or proof of actual exploit loss.

## Why Program #1 cannot be rescued

Program #1's `claim_deadline=1792666800` was **2026-10-22 18:00 ICT**. Issuer A called `attach_report(1,...)` at **18:10:33 ICT**, in [the original transaction](https://explorer-studio.genlayer.com/tx/0xa618ededb65dbcb0394aaf7af50b84744c26a93bee94310fe7463eacf3df39b8). Receipt was `FINALIZED`, consensus `Accepted`, but **GenVM execution ERROR / Rollback: `Report submission window closed or not started`**. Do not confuse consensus acceptance with successful contract execution. The V2 contract enforces `_now() >= program['claim_deadline']` as a hard failure in both `attach_report` and `attest_report`; claims are also closed. Program #1 can remain in `AWAITING_INCIDENT_REPORT` without an explicit terminal program state; creating a new program is the safe path. The post-window report exists on GitHub, but it was never accepted by the contract in this failed transaction.

## New precommitted Program #2 parameters — create with issuer wallet A

**New V2 contract:** `0x844BE9205a755900B7a6E40596DeDbdC69825e63`, GenLayer Studionet 61999.

**Issuer A:** `0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb`
**Attestor C:** `0x60bfdf6315294c7856acdc0b80d7bd40217debff`
**Potential claimant B:** `0xd6b8a3a5eb329410d9504784812b8569afa8c2af`

The policy is pinned before its synthetic incident:

- Immutable Git commit `8165ba339606315fb2d53111524ad7e0d0478435`
- [Read frozen policy](https://github.com/bearbaba/COVERDICT/blob/8165ba339606315fb2d53111524ad7e0d0478435/evidence/v2_program_02_policy.txt)
- SHA256 verified from exact 2456-byte ASCII file: `e45afdb4965286995263a86d9a2456745438f5747234f56a155b41e2c9eccf3a`

| Exact `create_program` argument | Value |
|---|---|
| `label` | `V2 attested Sepolia synthetic receipt drill #2` |
| `deposit_contract` | `0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb` |
| `incident_start` | `1792672200` (**Oct 22 19:30 ICT**) |
| `incident_end` | `1792672800` (**Oct 22 19:40 ICT**) |
| `claim_deadline` | `1792839600` (**Oct 24 18:00 ICT**) |
| `policy_url` | `https://raw.githubusercontent.com/bearbaba/COVERDICT/8165ba339606315fb2d53111524ad7e0d0478435/evidence/v2_program_02_policy.txt` |
| `policy_sha256` | `e45afdb4965286995263a86d9a2456745438f5747234f56a155b41e2c9eccf3a` |
| `award_credits` | `100` |
| `max_claims` | `3` |
| `attestor` | `0x60bfdf6315294c7856acdc0b80d7bd40217debff` |

**Critical time guard:** `create_program` requires incident_start at least 900 seconds in the future. For the exact new 19:30 window, execute **well before 19:15 ICT on October 22**, allowing time to finalize; if the cutoff is missed, do NOT reuse these params, make a new commit-pinned policy and schedule.

The new program ID is **expected #2** while on-chain program count is 1, but must be read from the `create_program` return value and `get_program(id)`; do not assume.

## Acceptance sequence and deadlines

1. **Now:** Issuer A signs `create_program(...,attestor)` with exact fields above and saves FINALIZED/SUCCESS receipt. Read `get_program_count`, `get_program(actual_id)`, which must have `status=AWAITING_INCIDENT_REPORT`.
2. **Oct 22, 19:30–19:40 ICT only (positive test):** claimant B optionally sends a small positive amount of native **Sepolia TEST-ETH** to recipient A on **Ethereum Sepolia (11155111)**. The independently verified on-chain timestamp must be within this exact window. It must be a **new** tx; a past transfer does not become valid later. No Mainnet tokens.
3. **After 19:40 ICT:** publish a **new, genuine post-window commit** of issuer-authored synthetic report at `evidence/v2_program_02_report.txt`. Compute its SHA256 and pin the raw URL to that new commit. Do not publish as an incident report before the window has ended.
4. Issuer A signs `attach_report(actual_program_id,report_url,report_sha256)` and confirms `AWAITING_ATTESTATION`.
5. Attestor C signs `attest_report(actual_program_id,report_sha256)` and confirms `OPEN_FOR_CLAIMS`.
6. Claimant B submits **before Oct 24 18:00 ICT** with `submit_claim(actual_program_id,real_sepolia_tx_hash)`. The old [B-to-A transfer](https://sepolia.etherscan.io/tx/0x9b9d33dfa1a9bcb3bd0a655290246020fdeed4a0df2d18aedc63e3aeb060d5ec), reportedly at ~15:37 Oct 22, can be used for **INELIGIBLE** after its timestamp is independently verified, but never for ELIGIBLE in this new window.
7. Call `resolve_claim(actual_case_id)` after claim submission (including during the seven-day review grace if needed). Preserve execution result, `Equivalence Principle Outputs`, individual validator traces and whether GenVM still warns about nondet storage. Read wallet B demo balance before/after. **Never conflate FINALIZED/Accepted with SUCCESS.**

## Limitations

The signer role-separation is observable but does not establish actual independent attestation. The report and policy are synthetic, issuer-controlled GitHub documents. Sepolia REST receipt evidence is not finalized Ethereum chain proof. No redeemable assets, actual exploit damage or Mainnet fitness is proven.
