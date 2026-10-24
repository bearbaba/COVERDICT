# COVERDICT V2.2 — Live GenLayer Studionet Anti-Grief Acceptance

**Status:** New V2.2 contract deployed and three live read checks have returned values. No live adversarial transactions have yet been documented. This is a **test plan**, not a record of passing attack tests.

**Single selected instance:** [0x65F96FB47380996Aa672b1eC1de8DF95451eC150](https://explorer-studio.genlayer.com/address/0x65F96FB47380996Aa672b1eC1de8DF95451eC150) · [Studio import](https://studio.genlayer.com/?import-contract=0x65F96FB47380996Aa672b1eC1de8DF95451eC150)  
**Deployment tx:** [0x79ce0913a20f4aaa09749928b56740cbf774a631f79ca52bb8ba337be874d88f](https://explorer-studio.genlayer.com/tx/0x79ce0913a20f4aaa09749928b56740cbf774a631f79ca52bb8ba337be874d88f).  
**Independent user-provided read results:** get_contract_version() = "2.2.0-testnet-admission-candidate"; get_program_count() = 0; get_case_count() = 0.

**Other V2.2 deployment:** 0xd849FAED757cf4c3f92602cE8732e4EcB8bF6a39. Do NOT mix its contract state, case IDs or proofs into this test. Existing V2 Program #005 remains at 0x844BE9205a755900B7a6E40596DeDbdC69825e63 and is historical, not part of this attack rehearsal.

## Verified live Program #001 creation (24 Oct 2026)

**Program created:** `create_program` on selected V2.2 instance [`0x65F96FB47380996Aa672b1eC1de8DF95451eC150`](https://explorer-studio.genlayer.com/address/0x65F96FB47380996Aa672b1eC1de8DF95451eC150).  
**Creation transaction:** [`0xd4f894567e91724295d9b736d15c7aa10bbf0657c51b622984f52e29d8548e40`](https://explorer-studio.genlayer.com/tx/0xd4f894567e91724295d9b736d15c7aa10bbf0657c51b622984f52e29d8548e40).  
**Recorded by user:** FINALIZED / GenVM SUCCESS / Consensus Accepted (5/5 Agree), return value `1`; Program #001.  
**Independent source integrity check:** SHA256 of exact [immutable pinned policy](https://github.com/bearbaba/COVERDICT/blob/c9af56599af03cc0939810e124f8fae00a765c4b/evidence/v22_antigrief_20261024_2100_policy.txt), including its final newline, equals `6d28fec817147c71021eef61fa684ea9621fc8704bd05a9ed25c70151b010762`; matches on-chain create input.  
**Incident timing:** 24 Oct 21:00–21:10 ICT (UNIX `1792850400`–`1792851000`). Submission deadline 23:30 ICT (`1792859400`).  
**Test verdict:** setup PASSED. The capacity-grief and receipt-preemption attack tests remain **NOT YET EXECUTED**.

## Report attachment and independent attestation completed (24 October 2026)

The user supplied both FINALIZED / GenVM SUCCESS / Consensus Accepted calls on **the selected V2.2 contract** (`0x65F96FB47380996Aa672b1eC1de8DF95451eC150`).

- **Wallet A, 21:15:09 ICT:** [`attach_report(1, pinned_report_url, pinned_report_sha256)`](https://explorer-studio.genlayer.com/tx/0xc4e805ea0596ca7e977288e9d787478c136d5cc147e12a3b9198d5c6918263e4), TX `0xc4e805ea0596ca7e977288e9d787478c136d5cc147e12a3b9198d5c6918263e4`. Immediately following this call, user read `status=AWAITING_ATTESTATION`, `report_attested=false`, `submitted=approved=claimed=0`, report SHA correctly pinned.
- **Wallet C, 21:18:47 ICT:** [`attest_report(1, pinned_report_sha256)`](https://explorer-studio.genlayer.com/tx/0x07cfa6c166de1a4525b3999e161a28eaa952e652c5ec391b92dd332c0f1d43a1), TX `0x07cfa6c166de1a4525b3999e161a28eaa952e652c5ec391b92dd332c0f1d43a1`, separate designated attestor wallet `0x60Bfdf6315294c7856Acdc0B80D7Bd40217DEBff`.
- **Exact report digest used twice:** `a1e2952ad7631f9aff6e006bdd10543484c6557382f23e11adcfd94353ad556d`. The immutable Git URL is `https://raw.githubusercontent.com/bearbaba/COVERDICT/0432e00dfd1ce0e3f1747eb2457d619a0e5215c0/evidence/v22_antigrief_20261024_2110_report.txt`.
- **Readback after attestation:** still requested; expected `status=OPEN_FOR_CLAIMS`, `report_attested=true`. This is not yet independently recorded.
- **Attack reproduction:** none documented so far. Do **not** claim the two admission vulnerabilities are fixed on-chain solely on the basis of attestation.

## Candidate Sepolia receipt supplied by claimant (21:03 ICT, 24 Oct)

- **Candidate transaction:** [`0xdacd7b2f146f69dfe2c8f8296e63c7a0176ed5095efa66cd751bd6f4401cb809`](https://sepolia.etherscan.io/tx/0xdacd7b2f146f69dfe2c8f8296e63c7a0176ed5095efa66cd751bd6f4401cb809).
- **User-supplied Etherscan excerpt:** `Success`, block `11984250`, native Sepolia test-ETH transfer from wallet B `0xD6b8A3A5eB329410D9504784812b8569afA8C2aF` to wallet A `0x4C7cb73aC8F8999af21cfc9fF4cF2333a9508Dcb`.
- **Verification pending:** the pasted excerpt gives only a relative "36 secs ago" timestamp and inconsistent amount formatting; exact block timestamp and transfer value must be verified independently through Blockscout. Both excerpts show a positive transfer, but this record is **not an independent source confirmation**.
- **Report stage:** the incident ends **21:10 ICT**; only after this point may the issuer publish the immutable post-window report, attach it, and have the distinct attestor sign the exact digest. No attack-case result is asserted yet.

## Frozen one-slot program configuration

**Clock:** Vietnam/ICT UTC+07:00. All inputs below are UNIX seconds in UTC. **Create the program BEFORE 21:00 ICT, at least 15 minutes prior to its start**; otherwise do not force out-of-window transactions. If the window is missed, prepare a fresh dated pinned policy and schedule a new program.

| create_program parameter | Value |
| --- | --- |
| label | `COVERDICT V2.2 Anti-Grief 2100` |
| deposit_contract | `0x4C7cb73aC8F8999af21cfc9fF4cF2333a9508Dcb` |
| incident_start | `1792850400` (24 Oct 21:00 ICT) |
| incident_end | `1792851000` (24 Oct 21:10 ICT) |
| claim_deadline | `1792859400` (24 Oct 23:30 ICT) |
| policy_url | `https://raw.githubusercontent.com/bearbaba/COVERDICT/c9af56599af03cc0939810e124f8fae00a765c4b/evidence/v22_antigrief_20261024_2100_policy.txt` |
| policy_sha256 | `6d28fec817147c71021eef61fa684ea9621fc8704bd05a9ed25c70151b010762` |
| award_credits | `100` |
| max_claims | `1` |
| attestor | `0x60Bfdf6315294c7856Acdc0B80D7Bd40217DEBff` |

Immutable policy: [pinned GitHub](https://github.com/bearbaba/COVERDICT/blob/c9af56599af03cc0939810e124f8fae00a765c4b/evidence/v22_antigrief_20261024_2100_policy.txt).

## Four wallets and scheduled steps

- **A** — issuer and recipient `0x4C7cb73aC8F8999af21cfc9fF4cF2333a9508Dcb`; `create_program`, `attach_report`.
- **B** — rightful Sepolia sender and claimant `0xD6b8A3A5eB329410D9504784812b8569afA8C2aF`; send small Sepolia test-ETH, submit and resolve, then claim the synthetic award.
- **C** — authorized attestor `0x60Bfdf6315294c7856Acdc0B80D7Bd40217DEBff`; sign report hash with `attest_report`.
- **D** — separate non-issuer, non-attestor, non-claimant **attacker testing wallet**; submit forged and then copied receipts. D cannot be A, B or C.

1. Before 21:00 ICT: A signs `create_program` for the fixed one-slot program. Record returned program ID (expected 1 **only if still zero**).
2. **Between 21:00 and 21:10 ICT**: B sends a direct positive-value native Sepolia test-ETH transaction to A. Confirm final block timestamp is inside window; save exact receipt hash.
3. **After 21:10 ICT and before 23:30 ICT**: publish a new immutable SHA256-pinned report affirming the exact synthetic class, recipient and window and noting the candidate receipt hash as an untrusted pointer. A calls `attach_report(program_id, report_url, sha256)`, C then calls `attest_report(program_id, sha256)`.
4. D calls `submit_claim(program_id, "0x0000000000000000000000000000000000000000000000000000000000000000")` to create the **fake receipt** case. Verify `get_program`: `submitted = 1`, `approved = 0`, `claimed = 0`. This already proves the false claim did not exhaust the one verified slot.
5. D calls `resolve_claim(fake_case_id)` with the nonexistent receipt, expecting `SUBMITTED / UNVERIFIABLE` (not approved), then `cancel_unverifiable_claim(fake_case_id)` to release D's own temporary slot. If this review is unavailable, D can wait 30 minutes for expiry, but deadlines must still permit the rest.
6. D submits **B's publicly visible real Sepolia receipt hash** first using `submit_claim(program_id, B_tx_hash)`. Verify `approved = 0`. D's provisional claim must NOT lock that hash.
7. **Before D's claim is resolved**, B submits the **same B_tx_hash** with B's own wallet. Submission must be accepted and assigned its own case ID. This demonstrates attacker-first hash preemption is impossible.
8. D resolves the copied-hash case, expecting **DENIED / INELIGIBLE** due to `from != D`, not `APPROVED`. B resolves the rightful case, requiring genuine GenLayer assessment. If policy/report are consistent, expected is `APPROVED / ELIGIBLE`; if UNVERIFIABLE, do not pretend success.
9. If B is approved, B calls `claim_demo_award(B_case_id)`, expects **+100 non-redeemable demo credits**. A second `claim_demo_award(B_case_id)` must be rejected. `get_program` should show `submitted = 3, approved = 1, claimed = 1`, with only the rightful wallet awarded.
10. Record exact explorer tx hashes for **A create, B Sepolia, A attach, C attest, D fake submit, D cancel, D copied-hash submit, B submit, D resolve, B resolve, B claim, duplicate award refusal**. Each on-chain outcome must be confirmed using read methods and not merely `FINALIZED` alone.

**Caveat:** the 30-minute provisional lifetime starts at each submission. Do not leave a B case unresolved for more than 30 minutes. The V2 public frontend is not yet compatible with V2.2's `submitted` historical count; **use Studio** for this acceptance.

## Required reviewer proof (not yet collected)

The final reviewer response should link every applicable transaction on the **selected V2.2 address** and show:
- Attacker fake hash: zero approvals and capacity still available.
- Attacker copies B receipt first: B's later `submit_claim` still succeeds before attack resolution.
- Attacker cannot obtain award using B's receipt; only rightful sender's verified case is approved and claimed.
- Receipt replay and second redemption fail under retained protections.

**No submitted or approved attack-case transactions are claimed at the time this plan was authored.** The original three read responses only prove the new deployed instance and initial empty state.
