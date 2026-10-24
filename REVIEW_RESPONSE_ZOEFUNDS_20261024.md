# Response to zoefunds — claim admission / receipt preemption

**Review request:** 24 October 2026 · GenLayer Projects · COVERDICT  
**Response state:** Separate V2.2 deployed on GenLayer Studionet at [`0x65F96FB47380996Aa672b1eC1de8DF95451eC150`](https://explorer-studio.genlayer.com/address/0x65F96FB47380996Aa672b1eC1de8DF95451eC150) and **both requested admission-attack scenarios reproduced successfully on-chain** in Program #001. Wallet B's legitimate claim was approved and awarded +100 demo credits; a second award attempt rolled back, with balance remaining 100. [Full linked test record](V2_2_FINAL_LIVE_RESULT_20261024.md). The old V2 contract and its Program #005 historical demonstration remain unchanged; this is not an audit.

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

## Signed live security evidence (selected contract, Program #001)

- **Source and deployment:** [V2.2 deployment](https://explorer-studio.genlayer.com/tx/0x79ce0913a20f4aaa09749928b56740cbf774a631f79ca52bb8ba337be874d88f); version readback `2.2.0-testnet-admission-candidate`; new storage initial counts 0/0.
- **Immutable policy, report and distinct-wallet attestation:** [create program](https://explorer-studio.genlayer.com/tx/0xd4f894567e91724295d9b736d15c7aa10bbf0657c51b622984f52e29d8548e40), [attach](https://explorer-studio.genlayer.com/tx/0xc4e805ea0596ca7e977288e9d787478c136d5cc147e12a3b9198d5c6918263e4), [attest](https://explorer-studio.genlayer.com/tx/0x07cfa6c166de1a4525b3999e161a28eaa952e652c5ec391b92dd332c0f1d43a1).
- **Capacity-grief test:** adversary D [submitted fake Sepolia hash as Case #001](https://explorer-studio.genlayer.com/tx/0x944cdc05076e676835db2bf005122bf71a2e54f0617e30f70bffa084c7337bc0), `submitted=1` but `approved=0` for `max_claims=1`. [Review](https://explorer-studio.genlayer.com/tx/0x5ce39c1f51008435c1c9e3ddf9bbd5d6c1acb80afb202aedcd2b73277c7989cd) returned `UNVERIFIABLE` and 0 credits; the claimant then cancelled, and case readback was `CANCELLED_UNVERIFIABLE`.
- **Receipt-preemption test:** adversary D [submitted wallet B's public Sepolia hash first, Case #002](https://explorer-studio.genlayer.com/tx/0x18dbc5e044801d62f0aad7bfce1547617a8dcbbf095a34bce217b569627db52c); B [successfully submitted the identical hash afterward, Case #003](https://explorer-studio.genlayer.com/tx/0xb5fa49abe77ec104909036c697a61e7a4e3354c7b920e3497c903cc58fc8a805). D's [resolution](https://explorer-studio.genlayer.com/tx/0xfc46cefe422201ea9d22960214a0821a8556701bd06fcc6f57e2fb4d40ab8437) was `DENIED / INELIGIBLE`; rightful B's [resolution](https://explorer-studio.genlayer.com/tx/0x4b6742bcc6fbb8ef5372d6e673a362bef2cdabaf4f6a667a26c8455cd8a84c44) was `APPROVED / ELIGIBLE`.
- **Exactly-once award:** wallet B [claimed 100 demo credits for Case #003](https://explorer-studio.genlayer.com/tx/0x3b98e7c024b7766494473113cfb41ba7bd85eada13c6242967ccafa55cfb6148). `get_case(3)` read `CLAIMED`; `get_program(1)` read `submitted=3, approved=1, claimed=1`. Wallet B's `get_demo_balance` read `100`. Retrying `claim_demo_award(3)` in [the rejected duplicate-award TX](https://explorer-studio.genlayer.com/tx/0xd2c2187109e279a29e237bae0515c84090d8bc1b508875cf4f2f52773886c965) produced the expected `FINALIZED / ERROR` rollback `No unclaimed approved award` with five agreeing validators.

**Outstanding, clearly separated from completed tests:** V2.2-aware browser demo and UI integration (the existing website/video reflect V2), independent live cross-program replay reproduction (covered by automated unit regression only), and cancellation TX link. An actual third-party security audit has not occurred.

Known residual limitations: provisional submissions from many sybil wallets can grow state; the app still uses one Blockscout API and issuer-authored synthetic reports, not independently authenticated loss evidence. This is not mainnet finance.
