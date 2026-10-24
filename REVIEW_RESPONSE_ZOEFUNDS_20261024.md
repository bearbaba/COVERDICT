# Response to zoefunds — claim admission / receipt preemption

**Review request:** 24 October 2026 · GenLayer Projects · COVERDICT  
**Response state:** V2.2 has been deployed to a separate Studionet instance according to the user-provided Studio screenshot (selected address `0x65F96FB47380996Aa672b1eC1de8DF95451eC150`). **Security acceptance is NOT yet complete:** chain readbacks, attacker-first transactions and legitimate follow-up award still need to be run and linked. The old V2 contract and Program #005 demonstration remain unchanged.

Thank you for identifying the two real claim-admission vulnerabilities. We reproduced their causes in V2 source:

1. `submit_claim()` incremented `program.submitted` and checked `submitted >= max_claims` **before validating the Sepolia receipt**. A forged hash permanently exhausted a one-slot program.
2. `submit_claim()` wrote `used_transactions[tx_hash] = true` before sender verification. An unrelated caller could preempt a publicly known real Sepolia hash and block its legitimate sender across programs.

## V2.2 correction

Source: [contracts/CoverdictV2_2.py](contracts/CoverdictV2_2.py).  
Tests: [tests/test_coverdict_v22.py](tests/test_coverdict_v22.py).  
Detailed threat-model and verification notes: [V2_2_ADMISSION_SECURITY_REVIEW.md](V2_2_ADMISSION_SECURITY_REVIEW.md).

- Submission is **provisional**, local to the submitting wallet/program, and **does not consume global receipt hashes** or verified program capacity. `submitted` is a historical count and can exceed `max_claims`; `approved` is the committed award-capacity count.
- Only successful objective receipt checks **plus GenLayer consensus `ELIGIBLE`** atomically set `claimed_wallets[wallet:program]`, `used_transactions[hash]` and increment `program.approved`.
- A forged, missing, invalid or wrong-sender receipt cannot block another wallet's legitimate claim, even in a single-slot program. An attacker cannot steal a public transaction hash merely by submitting it before the owner.
- A pending wallet slot expires after **30 minutes**, can be released permissionlessly by `expire_pending_claim`, or cancelled by its owner after `UNVERIFIABLE` review. Existing anti-replay, separate attestor, wallet-sender match, digest verification and exactly-once demo-credit award are preserved.
- Added focused regression cases for attacker-first one-slot exhaustion, active forged receipt preemption, wrong-sender denial, cross-program replay, 30-minute recovery, claimant-only cancellation and successful subsequent claimant redemption.

## Reproduction and deployment boundary

```sh
python -m pytest -q tests/test_coverdict_v22.py
python -m pytest -q tests/
genvm-lint check contracts/CoverdictV2_2.py
```

**Selected new V2.2 deployment:** [`0x65F96FB47380996Aa672b1eC1de8DF95451eC150`](https://explorer-studio.genlayer.com/address/0x65F96FB47380996Aa672b1eC1de8DF95451eC150) · [Studio import](https://studio.genlayer.com/?import-contract=0x65F96FB47380996Aa672b1eC1de8DF95451eC150). An earlier separate deploy record exposed `0xd849FAED757cf4c3f92602cE8732e4EcB8bF6a39`; to prevent mismatched reviewer evidence, all future V2.2 test receipts should target the selected `0x65F96FB47380996Aa672b1eC1de8DF95451eC150` address. We do not claim that either new deployment has changed immutable V2 `0x844BE9205a755900B7a6E40596DeDbdC69825e63`. Program #005 / Claim #002 and the original YouTube video remain earlier V2 workflow evidence, **not** adversarial security acceptance of V2.2.

**Still required for acceptance:** confirm the selected V2.2 instance via `get_contract_version()`, `get_program_count()`, and `get_case_count()`; archive the exact deployment receipt; validate actual `get_program`/`get_case` state in the two adversarial flows with multiple wallets; and publish a V2.2-aware browser demo (the old V2 UI uses `submitted` as a cap and must not simply be pointed at the new contract).

Known residual limitations: provisional submissions from many sybil wallets can grow state; the app still uses one Blockscout API and issuer-authored synthetic reports, not independently authenticated loss evidence. This is not mainnet finance.
