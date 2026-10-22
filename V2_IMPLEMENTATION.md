# COVERDICT V2 — isolated experimental contract (Phase A)

**State: source implementation and test suite only. NOT DEPLOYED. NOT AUDITED. NOT MAINNET-READY.** The reviewed V1 contract at `0x044DB5B1d148d30f8EdF591497d8726F66C22a16` and its original three claims remain untouched. [Original V1 acceptance](ACCEPTANCE.md).

## V2 goals already implemented in code

1. **Avoid storage capture in GenVM nondeterministic callbacks.** The function `_assess(program, case)` lives at module scope instead of on a contract instance. Leader and validator closures only capture immutable-in-the-call plain-dict snapshots `policy` and `claim` and independently re-fetch SHA256-pinned source text and the Sepolia receipt. A unit test inspects each closure and rejects captured contract objects. **Actual GenVM warning removal remains unverified until a newly signed Studionet deployment is tested.**
2. **Two distinct signers for synthetic incident coverage.** At program creation, the issuer nominates an attestor wallet different from both issuer and affected Sepolia recipient. Only issuer attaches a pinned report; only the precommitted attestor can acknowledge its exact SHA256 digest. Claim submissions stay BLOCKED while `AWAITING_ATTESTATION`.
3. **On-chain auditable endorsement.** The attestor must separately sign `attest_report(program_id, report_sha256)` after the scheduled incident window and before the claim deadline. The program records `attestor`, `report_attested`, and `attested_at`. The issuer and attestor may not be claimants for that program.
4. **Cross-program transaction replay guard.** V2 rejects reuse of the exact same Sepolia transaction hash in another V2 program, even with a different claimant wallet. V1 only prevented replay within a single program.
5. **Three-valued decisions remain intact.** ELIGIBLE -> APPROVED, INELIGIBLE -> DENIED, missing/unverifiable -> stays SUBMITTED without credits. Credits remain testnet-only, nonredeemable virtual balances. No ETH/GEN or ERC20 transfers.

## New contract and method changes

File: [`contracts/CoverdictV2.py`](contracts/CoverdictV2.py)

Contract class: `CoverdictV2`. A new instance has entirely independent storage; there is **no in-place migration** of V1 cases, programs, credits or wallet balances.

```text
get_contract_version() -> "2.0.0-testnet-experimental"

create_program(label, deposit_contract, incident_start, incident_end,
               claim_deadline, policy_url, policy_sha256,
               award_credits, max_claims, attestor) -> program_id
# The last attestor argument is NEW and REQUIRED.

attach_report(program_id, report_url, report_sha256)
# issuer-only: transitions to AWAITING_ATTESTATION

attest_report(program_id, report_sha256)
# attestor-only: transitions to OPEN_FOR_CLAIMS

submit_claim(program_id, tx_hash)
resolve_claim(case_id)
claim_demo_award(case_id)
close_unverifiable_claim(case_id)
get_program(id), get_case(id), get_demo_balance(wallet)
get_program_count(), get_case_count()
```

The legacy frontend `web/` is intentionally bound to the **V1** contract address and ABI. Do not silently retarget it to this new contract. Build and verify a separate V2 frontend or add an explicit version-aware switch only after new deployment, ABI and real-wallet testing.

## Actor separation (testnet)

| Role | What this actor can do | What this actor cannot do |
|---|---|---|
| Issuer A | Create program, publish and attach SHA256-pinned synthetic policy/report | Self-attest or claim demo credits in own V2 program |
| Attestor D | Endorse **only the exact report hash**, after incident window | Be issuer, designated deposit recipient or a claimant in same program |
| Claimant C | Submit own genuine Sepolia tx hash, resolve, claim virtual credits when approved | Replace a report or claim under issuer/attestor address |
| Sepolia deposit recipient B | Receive synthetic test-ETH when deliberately participating | Serve simultaneously as V2 report attestor |

**Distinct wallet addresses do not prove independent people, organizational authority or objective incident facts.** They merely make conflicts and sign-offs observable on-chain. For a meaningful demo, use an attestor controlled by a separate participant; issuer-run second accounts only demonstrate access checks. Source text is still pinned to the issuer-controlled repository and transaction authenticity still depends on Blockscout REST.

## Test-first release plan

- Gate 1 — **CI:** `genvm-lint check contracts/CoverdictV2.py`, py_compile, shim regression suite + V1 suite, web build. Source and unit tests must be green.
- Gate 2 — **New Studionet instance, not V1:** deploy the exact `CoverdictV2.py` source with wallet signature using Normal/Full Consensus. Store contract address, immutable Git commit SHA, deployment transaction and exact source file. Do not claim this is deployed until confirmed.
- Gate 3 — Run `get_contract_version()` then test issuer A create -> issuer A attach after window -> attestor D separate sign -> claimant C submit -> resolve -> read case/credits. Test invalid attestor, premature submit and unauthorized award.
- Gate 4 — Run one case each for ELIGIBLE, INELIGIBLE, UNVERIFIABLE on **V2**, capturing original leader and individual validator traces. Check nonfatal `Detected pickling storage class` warning disappears; if it persists, P0 remains open. Do not reuse historical V1 results as V2 test proof.
- Gate 5 — Re-read V1 original contract and all 3 cases to prove this independent experiment did not disturb the old MVP. Do not map V1 demo credits to V2 without an explicitly designed migration.
- Gate 6 — Implement a V2-aware UI with clear deployment/version/environment labels; verify wallet A, D, C on two real browsers before declaring V2 public.

## Explicit design limitations / blockers

- The attestor confirms **a document hash**, not whether the incident happened. This is not an independent post-mortem, proof of DeFi loss, legal authority or audit of underlying data.
- One Blockscout Sepolia REST endpoint remains the source for transaction metadata; validators re-fetch it but do not authenticate Ethereum finality.
- Issuer or attestor could be sybil-controlled despite distinct wallets. There is no registry of independent incident authority, bond, penalty or identity governance.
- The consensus procedure checks `outcome` and normalized source `digest` while the human-readable `reason` comes from the leader. Validator reason-level review and truly contested semantic benchmark remain future work.
- No economic appeal, challenge bond, treasury, paid payout, ERC20 support, loss calculation, real asset custody, external partner or Mainnet settlement.
- **Fail closed:** unknown or missing receipt data returns UNVERIFIABLE, not a claim of fraud or an automatic credit.

## Phase B & C

**B — Objective evidence:** precommitted incident source-authority registry, distinct issuer/witness attestations backed by independently published sources, verified Ethereum finalized transaction proof(s) or independent-source quorum, deterministic loss/exposure accounting, explicit conflicting-evidence tests.

**C — Meaningful adjudication:** test ambiguous incident coverage with multiple contradictory inputs and validator disagreement, record individually inspectable leader/validator reasoning, build an appeals/corrections flow before considering any redeemable value.

This V2 is intentionally a safe **predeployment foundation**; code/CI completion must never be described as on-chain V2 validation.
