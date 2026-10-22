# COVERDICT V2 Program #1 — Attestor-gated synthetic drill

**State:** ON-CHAIN PROGRAM #1 CONFIRMED. Issuer wallet A signed `create_program`, FINALIZED/SUCCESS with consensus Accepted and returned ID 1 at 2026-10-22 **15:03:11 ICT**. A user-provided `get_program(1)` read matches the immutable policy and attestor wallet; a separate RPC acceptance test is being added. The incident report and attestor signature have **NOT** yet been committed or confirmed. TESTNET-ONLY, virtual credits, no actual DeFi loss.

## Immutable policy

- Frozen Git commit: `c2f792197f12d0ab939bf83a0e3179f31f85088d`
- Raw URL: `https://raw.githubusercontent.com/bearbaba/COVERDICT/c2f792197f12d0ab939bf83a0e3179f31f85088d/evidence/v2_program_01_policy.txt`
- Exact UTF-8 bytes: `2676` (the title contains one em dash)
- Verified SHA256: `5150f0cb08b88218dd9fa1e375782b741cc5aaca8f1a96dd0f799f2633bb653c`
- [Immutable policy source](https://github.com/bearbaba/COVERDICT/blob/c2f792197f12d0ab939bf83a0e3179f31f85088d/evidence/v2_program_01_policy.txt)

## Real deployed contract

- Studionet chain ID 61999, **V2** `0x844BE9205a755900B7a6E40596DeDbdC69825e63`
- [Studio import](https://studio.genlayer.com/?import-contract=0x844BE9205a755900B7a6E40596DeDbdC69825e63)
- Independent read-only [RPC acceptance](https://github.com/bearbaba/COVERDICT/actions/runs/39743045149): version `2.0.0-testnet-experimental`, initial program count **0**, initial case count **0**, all three legacy V1 cases intact.
- This source remains unaudited. Its new attestor and nondet paths **have not been live-tested**.

## Original on-chain creation transaction (2026-10-22)

- [`create_program` FINALIZED/SUCCESS, consensus Accepted](https://explorer-studio.genlayer.com/tx/0x1b6717cb38257cd8d761ffe27d91cfc3fa53f5021a5b37b81313ecb894949636) — full hash `0x1b6717cb38257cd8d761ffe27d91cfc3fa53f5021a5b37b81313ecb894949636`.
- Origin: issuer wallet A `0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb`; destination: **V2** `0x844BE9205a755900B7a6E40596DeDbdC69825e63`; mode Normal, zero rotations, 5 initial validators, `Execution SUCCESS`, `Return Value=1`.
- User-provided post-create state: `get_program(1).status=AWAITING_INCIDENT_REPORT`, `submitted/approved/claimed=0/0/0`, `report_attested=false`, `attested_at=0`, empty report URL/digest; locked 16:00–16:10 incident and 18:00 submission deadline.
- **Independent verification:** [Studionet RPC smoke #39745600960](https://github.com/bearbaba/COVERDICT/actions/runs/39745600960) PASS. Reads version, exactly 1 program / 0 cases, exact issuer, attestor, deposit address, commit-pinned policy digest and time window, stage `AWAITING_INCIDENT_REPORT`, while original V1 case outcomes remain unchanged.
- All recorded policy and attestor fields exactly match the precommitted file above; this is only proof of **program creation**, not report authenticity, an attestor endorsement or actual V2 AI adjudication.
- Individual validator votes and full deploy receipt/source parity have not been supplied. The original testnet source remains unaudited.

## Planned actors

- **Issuer + designated Sepolia recipient A:** `0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb`
- **Separate signing attestor C:** `0x60bfdf6315294c7856acdc0b80d7bd40217debff`
- **Potential demo claimant B:** `0xd6b8a3a5eb329410d9504784812b8569afa8c2af`
- Distinct addresses do NOT prove independent people or a real independent security report. Wallet A as issuer and recipient is an explicitly synthetic exercise, not valid objective insurance evidence.

## Exact V2 create_program parameters — issuer A

| Field | Value |
|---|---|
| label | `V2 attested Sepolia synthetic receipt drill #1` |
| deposit_contract | `0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb` |
| incident_start | `1792659600` (2026-10-22 **16:00 ICT**) |
| incident_end | `1792660200` (2026-10-22 **16:10 ICT**) |
| claim_deadline | `1792666800` (2026-10-22 **18:00 ICT**) |
| policy_url | `https://raw.githubusercontent.com/bearbaba/COVERDICT/c2f792197f12d0ab939bf83a0e3179f31f85088d/evidence/v2_program_01_policy.txt` |
| policy_sha256 | `5150f0cb08b88218dd9fa1e375782b741cc5aaca8f1a96dd0f799f2633bb653c` |
| award_credits | `100` |
| max_claims | `3` |
| attestor | `0x60bfdf6315294c7856acdc0b80d7bd40217debff` |

**Timing guard:** deployed V2 requires `incident_start >= now + 900 seconds`. This specific policy can only be used for creation if execution is finalized **before 15:45 ICT on October 22, 2026**, allowing finality delay. If missed, create a new immutable policy with a new window and fresh digest; **never** edit only the timestamps in a signed or pinned program.

## Subsequent safe phases

1. **DONE by issuer A:** Created Program #1, returned `1` in a FINALIZED/SUCCESS GenLayer transaction; user-read `get_program(1)` confirms `AWAITING_INCIDENT_REPORT`. A separate read-only RPC acceptance is tracked.
2. During **16:00–16:10 ICT**, optional real **Sepolia testnet-only** positive proof: wallet **B** sends a small native *Sepolia test-ETH* amount to wallet **A**. Do not send mainnet ETH or any real-value token. Receipt sender must be **B** and destination **A**, successful and >0. Use a faucet if B lacks test-ETH/gas; do not fabricate a transaction.
3. **After 16:10 ICT**, create a new issuer-written **synthetic** incident report at `evidence/v2_program_01_report.txt`, commit it only then, compute exact SHA256 and freeze its new commit URL.
4. Issuer **A** calls `attach_report(actual_id, report_url, report_sha256)`; expect `AWAITING_ATTESTATION`, **not** `OPEN_FOR_CLAIMS`. The issuer cannot attest.
5. Attestor **C** (switch MetaMask account) calls `attest_report(actual_id, report_sha256)`, after independently viewing the document hash. Expect `OPEN_FOR_CLAIMS`.
6. Claimant **B** calls `submit_claim(actual_id, Sepolia_tx_hash)` by 18:00 ICT. Call `resolve_claim(actual_case_id)` with an actual returned case ID. If eligible, B can call `claim_demo_award(actual_case_id)` exactly once for 100 demo credits. If evidence unavailable, must stay `UNVERIFIABLE` with zero credits.
7. Capture **each** FINALIZED/SUCCESS receipt, leader/validator traces, warnings and read-back states. The first V2 `resolve_claim` must be examined specifically to see if the nondet storage pickling warning truly disappeared. No claim of solved runtime issue until then.

**IMPORTANT:** Program creation has now succeeded and been independently verified. Report attachment, attestation, claim submission, AI resolution and credits remain UNTESTED in V2 until on-chain FINALIZED execution and separate state read. Never migrate V1 claims/credits to V2 by assumption.

## Synthetic report text — DRAFT ONLY (not an issuer-attested evidence file)

The report below is a draft in project documentation. Do **not** create or publish `evidence/v2_program_01_report.txt` until **after 16:10 ICT**. The issuer-signed report attachment and attestor-signed digest endorsement must follow in that order.

```text
COVERDICT V2 PROGRAM #1 — SYNTHETIC INCIDENT REPORT
Report version: 1; TESTNET DEMONSTRATION ONLY.
Synthetic class: SIMULATED_DEPOSIT_MISROUTE_DRILL
Network: Ethereum Sepolia, chain ID 11155111
Designated recipient: 0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb
Simulated incident start: 2026-10-22T09:00:00Z
Simulated incident end: 2026-10-22T09:10:00Z

The issuer declares this recipient and fixed interval to be the complete
scope of the synthetic deposit-misroute drill. This is NOT an actual exploit,
unauthorized transfer, demonstrated financial loss or insurance obligation.

Under the prior SHA256-pinned program policy, a claim requires an independently
verifiable successful nonzero native Sepolia test-ETH transfer from the
GenLayer claimant's identical wallet to the designated recipient during
the recorded incident interval. The report does not establish eligibility
without independently verified receipt evidence and separate on-chain
attestor confirmation of the exact report SHA256.

A nonexistent or unverifiable receipt remains UNVERIFIABLE, not DENIED,
and receives zero demo credits. No real tokens or money are awarded.
END OF SYNTHETIC INCIDENT REPORT
```
