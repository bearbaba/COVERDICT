# COVERDICT — Project roadmap and go/no-go gates

## Product thesis

COVERDICT is proposed as an **integration-ready claim adjudication module**, NOT a new insurer. Partner protocols, DAOs and insurance/coverage providers define policies, source authority and reimbursement budgets. GenLayer contributes independent evaluation where source interpretation is actually contested. Deterministic chain proofs and payout controls remain outside the LLM.

### User value

- **Claimants:** verifiable reason for eligibility or rejection, correct wallet ownership checks, an auditable history and appeals.
- **Protocol operators:** a transparent program with precommitted rules, immutable source provenance and bounded awards.
- **Community and integrators:** public read-only case explorer and independent review of policy, incident evidence, outcomes and transactions.

**Current testnet reality:** only a Sepolia native test-ETH transfer and issuer-authored synthetic documents are evaluated. Transfer != loss. No insurance obligation or real payout exists.

## Gates

### Gate A — Reviewer-ready testnet MVP (next)

- [x] Live Studionet contract with a user-demonstrated positive wallet-bound claim lifecycle.
- [x] Accepted wallet demo balance of 100 and Program #2 1/1/1 counters.
- [x] Expected rollback after duplicate claim, five validator `Agree`, balance still 100.
- [x] Public GitHub policy/report commit pins, SHA256, and Sepolia receipt.
- [x] Source control CI lint + shim tests + web build on test branch (must continue passing after all updates).
- [x] Successful [positive `resolve_claim(1)` receipt](https://explorer-studio.genlayer.com/tx/0x7f577cf22801b6d12b84ad820381817c8e42e5252518b6b4d553865dc68909f5): FINALIZED / SUCCESS / Accepted, `APPROVED` and `ELIGIBLE` output with exact SHA256 digest.
- [ ] Retrieve and inspect individual validator votes/traces from positive adjudication; initial validators=5 alone is not proof of independent agreement.
- [x] Separate live `INELIGIBLE / DENIED` Case #2 with reason, receipt digest, zero award ([resolve receipt](https://explorer-studio.genlayer.com/tx/0x08dc22aca05271cbf270b1362248d89b95f52b06cbb040aac56d69c9011ba50a)).
- [x] Live Case #3 `UNVERIFIABLE / SUBMITTED` with empty digest and zero **authorized** award (user-provided Studio case read; [Program #3 record](PROGRAM_03.md)).
- [x] Independently verified post-resolution wallet C balance **0** and live Case #3 `UNVERIFIABLE` via [read-only RPC](https://github.com/bearbaba/COVERDICT/actions/runs/39733374513).
- [x] Original Case #3 `resolve_claim(3)` [FINALIZED/SUCCESS receipt](https://explorer-studio.genlayer.com/tx/0xa0c07abcc1742178c03b53342ea44a3c54d049f1864fc1f2b7e5a834cb9df4ab) returning `SUBMITTED`, consensus Accepted and `UNVERIFIABLE` evidence output; wallet C 0 credits independently verified.
- [ ] Individual validator vote traces for Cases #1–#3, source-fault recovery, and reproduction of the nonfatal nondeterministic-storage warning on a separately deployed contract. The original Case #1 and #3 resolution receipts are now captured.
- [ ] Investigate nonfatal GenVM nondet-storage warning on a NEW deployed contract (draft PR #6); preserve source parity of existing Studionet deployment.
- [ ] HTTPS deployed, public-read-only claim explorer and wallet flows validated on two actual browsers/wallets.
- [ ] Source parity between tested repository code and deployed Studionet contract.
- [ ] End-to-end narrated video with no fake screenshots or implied monetary insurance.

**Submit to GenLayer Projects only when reviewers can independently repeat core claims and evidence checks.** Points are non-guaranteed and secondary to trust.

### Gate B — Actual loss verification prototype

- [ ] Pin objective, independently authored incident evidence and source authority (e.g., signed protocol disclosure, public audited post-mortem and reproducible traces).
- [ ] Prove incident causation and a wallet's net loss, not just existence of a transfer.
- [ ] Handle on-chain swap, LP deposits, bridge transfers, token approvals, internal traces and replayed receipt IDs without phantom losses.
- [ ] Define acceptable proof of **NO** and **UNVERIFIABLE** separately from source outage; include expiry and appeal rights.
- [ ] Test validators that disagree and source substitution/prompt-injection attacks.
- [ ] Design program policy revocation, cancellation, caps and a wallet-indexed pagination API.

### Gate C — Mainnet prerequisites (no shortcuts)

- [ ] Independent contract and dependency security audits, plus source authentication and fallback oracle design.
- [ ] Economic loss accounting, reserves/funding sponsor, maximum payout caps and fraud controls.
- [ ] Appeals/challenges with due process and delayed irreversible settlement.
- [ ] Legal and regulatory review including geographic/service restrictions and insurance/coverage wording.
- [ ] Monitoring, incident response, operational runbook and third-party threat modeling.
- [ ] At least one external protocol/DAO partner willing to pilot integration.
- [ ] Mainnet deployment only after verified network availability, audit, pilot results and explicit economic authorization.

## Pivot thresholds

If coverage programs cannot obtain independent factual sources that can justify **both positive and negative** verdicts, pivot to verifiable incident reports and *nonfinancial* attestations rather than unsafe transfers. If real operators do not want an integration, stop adding claim types and validate a narrower workflow with external users first.

## What COVERDICT is not

It is not insurance, an investment, token yield, custody, escrow, a financial promise, an automated compensation fund, a cross-chain bridge or a detector that can identify hacks from any arbitrary URL.

### COVERDICT V2 — live program acceptance in progress

- [x] Separate V2 contract source and test harness, without modifying V1 on-chain records ([design and release gates](V2_IMPLEMENTATION.md)).
- [x] Module-level nondeterministic evaluator with callback capture regression test.
- [x] Distinct issuer/attestor on-chain roles, pinned report sign-off, and blocked self-claims.
- [x] Cross-program Sepolia receipt-hash replay protection in V2 code.
- [x] New V2 Studionet contract deployed: `0x844BE9205a755900B7a6E40596DeDbdC69825e63`, version and zero initial counts independently RPC-verified ([proof](https://github.com/bearbaba/COVERDICT/actions/runs/39743045149)); legacy V1 histories unchanged.
- [ ] Collect full V2 deployment receipt and independently establish source parity to commit `ce40f017...`; runtime write paths and validator traces remain unverified.
- [x] V2 `create_program` signed on Studionet, [FINALIZED/SUCCESS tx](https://explorer-studio.genlayer.com/tx/0x1b6717cb38257cd8d761ffe27d91cfc3fa53f5021a5b37b81313ecb894949636), return Program #1, independently verified via [read-only RPC](https://github.com/bearbaba/COVERDICT/actions/runs/39745600960) with issuer, attestor and immutable policy SHA256.
- [ ] V2 issuer report attachment -> attestor signed confirmation -> claimant write -> AI consensus and nonfatal warning check; incident window 16:00–16:10 ICT Oct 22.
- [ ] Verify nondeterministic-storage warning is absent in live V2 evaluation and collect individual validator traces.
- [ ] Introduce authenticated independent incident publisher and receipt finality/independent sources. Wallet address separation alone is insufficient.
- [ ] Produce and test a real document-disagreement benchmark with semantic edge cases and an appeal mechanism.
- [ ] V2-aware frontend with distinct ABI and explicit deployed contract selection; test real wallets in browsers.

- [x] V2 Program #2 issuer A signed [FINALIZED / GenVM SUCCESS creation tx](https://explorer-studio.genlayer.com/tx/0x0f8ff8869ee0f392887ee4734ebaacfb8a6a99a3a49e7278099359d3c2e0af41) at 18:25:19 Oct 22. **Actual** precommitted window is **19:30–19:40 ICT**, immutable source SHA256 `e45afdb4965286995263a86d9a2456745438f5747234f56a155b41e2c9eccf3a`, claim deadline Oct 24 18:00. Later 18:45 draft policy was never signed; see [V2 Program 2 record](V2_PROGRAM_02.md).
- [ ] After 19:40 ICT Oct 22, issuer pin post-window synthetic report, attach on-chain, then attestor sign SHA256 before Oct 24 claim deadline. No V2 report/attestation/resolve SUCCESS claimed yet.
