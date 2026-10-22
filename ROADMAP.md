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
- [ ] Successful AI decision transaction receipt and independent validator trace.
- [x] Separate live `INELIGIBLE / DENIED` Case #2 with reason, receipt digest, zero award ([resolve receipt](https://explorer-studio.genlayer.com/tx/0x08dc22aca05271cbf270b1362248d89b95f52b06cbb040aac56d69c9011ba50a)).
- [x] Live Case #3 `UNVERIFIABLE / SUBMITTED` with empty digest and zero **authorized** award (user-provided Studio case read; [Program #3 record](PROGRAM_03.md)).
- [x] Independently verified post-resolution wallet C balance **0** and live Case #3 `UNVERIFIABLE` via [read-only RPC](https://github.com/bearbaba/COVERDICT/actions/runs/39733374513).
- [ ] `resolve_claim(3)` execution receipt/individual validator traces, source-fault recovery and positive-decision original trace.
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
