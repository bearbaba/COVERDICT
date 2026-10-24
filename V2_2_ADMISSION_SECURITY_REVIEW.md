# COVERDICT V2.2 — Claim-Admission Security Patch (for zoefunds review)

**Status 24 October 2026: separately deployed V2.2 confirmed via read methods; targeted live security-reproduction scenarios PASS on Studionet Program #001 (capacity grief, attacker-first receipt preemption, rightful approval/claim and exactly-once award).** [Linked live receipts](V2_2_FINAL_LIVE_RESULT_20261024.md). **Still not audited; cross-program replay is regression-tested but not separately proven live.**  
**Selected V2.2 test instance:** [`0x65F96FB47380996Aa672b1eC1de8DF95451eC150`](https://explorer-studio.genlayer.com/address/0x65F96FB47380996Aa672b1eC1de8DF95451eC150) · [Import into Studio](https://studio.genlayer.com/?import-contract=0x65F96FB47380996Aa672b1eC1de8DF95451eC150).  
**Other deployment shown in an earlier explorer export:** [`0xd849FAED757cf4c3f92602cE8732e4EcB8bF6a39`](https://explorer-studio.genlayer.com/address/0xd849FAED757cf4c3f92602cE8732e4EcB8bF6a39). Both are separate addresses. Use only the selected `0x65F96FB47380996Aa672b1eC1de8DF95451eC150` instance for the security reproduction and annotate all resulting case IDs and receipts with this address.  
**Existing V2 remains unchanged:** [Studionet 0x844BE9205a755900B7a6E40596DeDbdC69825e63](https://explorer-studio.genlayer.com/address/0x844BE9205a755900B7a6E40596DeDbdC69825e63). Program #005/Claim #002 and original YouTube demo are historical V2 evidence. Do not imply a patch to that immutable deployment.

## Root cause and corrections

**Issue 1 — capacity griefing:** V2 decremented the availability of a max_claims=1 program at `submit_claim`, before checking the Sepolia sender or even whether the receipt existed. A forged provisional claim could fill the program permanently.

**Fix:** V2.2 `submit_claim()` creates a wallet-scoped, 30-minute **provisional** case only. `submitted` is now an audit count (may exceed max_claims). Award capacity is checked and reserved only when a verifiable receipt passes fixed deterministic checks and a GenLayer AI decision is `ELIGIBLE`, at which point `approved` increments atomically. Unverified/denied/expired claims spend **zero** award capacity. Once capacity is actually full, additional claims are rejected.

**Issue 2 — receipt preemption:** V2 marked `used_transactions[tx_hash]` at submission. An attacker could claim someone else's public Sepolia hash first, globally poisoning it.

**Fix:** A provisional hash is **never** added to `used_transactions`. Multiple provisional claims may mention the same public hash. The contract checks the actual receipt's `from` address against the connected GenLayer claimant during adjudication. The first *verified approved* case atomically commits the global receipt hash and wallet approval; later case resolves of the same hash are rejected as `REPLAY_REJECTED`, and new submit attempts are rejected. The attacker cannot appropriate the legitimate sender's receipt merely by submitting it first.

**Bounded recovery:** The temporary wallet-level admission slot expires after `PENDING_TTL_SECONDS = 1800` (30 min). Anybody can call `expire_pending_claim(case_id)` then release it. A claimant may cancel a reviewed `UNVERIFIABLE` case through `cancel_unverifiable_claim(case_id)` and submit a fresh receipt. A later `submit_claim` can also expire an outdated same-wallet entry automatically. There is no cross-wallet provisional cap: unverified attackers never hold a program-wide award slot.

**Existing protections retained:** SHA-256 pinned policy/report; separate attestor; issuer/attestor self-claim exclusion; authenticated Sepolia receipt status/sender/recipient/timestamp/value checks; GenLayer AI semantic review with independent validator recomputation and normalized digest matching; one verified approval per wallet/program; global anti-replay on **approved** receipts; exactly-once valueless demo credits.

## Regression tests

Run: `python -m pytest -q tests/test_coverdict_v22.py` and `python -m pytest -q tests/`. Cases include:

- Nonexistent transaction submitted first under `max_claims=1`: correct sender still submits, approves and claims.
- Attacker-first stolen public tx hash, both before and after attacker denial: rightful owner still wins.
- Duplicate provisional hash before resolution: only one verified approval wins; loser does not get award.
- Two programs attempt the same receipt: first verified approval locks it globally; later resolves reject.
- Provisional 30-minute expiry, explicit cleanup and same-wallet resubmission.
- `UNVERIFIABLE` cancellation restricted to the claimant, followed by a successful valid claim.
- Existing role-separation, attestation, source SHA256, one-time award, and wrong-sender denial tests.

**Important limits / next gate:** Tests use GenLayer Python shims and fixture receipts. Full Python suite 90 PASS and GenVM lint pass, but neither is an on-chain security audit. The selected V2.2 instance was deployed and version/empty-state reads and the two targeted live adversarial cases are documented in [V2_2_FINAL_LIVE_RESULT_20261024.md](V2_2_FINAL_LIVE_RESULT_20261024.md), including rightful approval, award and duplicate-redemption rejection. Browser integration is not complete; do not present V2 UI as compatible with V2.2. The existing V2 contract can never be changed by GitHub commits. New `submitted` semantics require a V2.2-aware frontend; the existing V2 UI still uses `submitted >= max_claims` to disable submission and must not be pointed at V2.2 unmodified.

## Reviewer reproduction

1. Use `contracts/CoverdictV2_2.py` and `tests/test_coverdict_v22.py`.
2. In the one-slot fixture, let the attacker submit a nonexistent receipt. Verify `approved=0`, `used_transactions[fake]=false`, and the rightful wallet is still admitted and awarded.
3. Next have the attacker submit the rightful wallet's public Sepolia hash. Verify the attacker gets `DENIED / INELIGIBLE` because of sender mismatch, then the owner submits and receives the award.
4. Re-submit a previously approved hash in another program: the contract rejects it without a second credit.
5. Inspect the expiry/cancel test to confirm unresolved submissions cannot permanently hold their sender's wallet slot.

The user-facing YouTube video documenting Program #005 is on the existing V2 and must not be called a V2.2 deployment video.
