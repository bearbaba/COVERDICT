# COVERDICT V2.2 — Program 1 live acceptance evidence

Network: GenLayer Studionet (61999).
Contract: 0x65F96FB47380996Aa672b1eC1de8DF95451eC150.
Date: 24 Oct 2026.

Verified transactions (explorer-studio.genlayer.com/tx/<hash>):
- Deploy: 0x79ce0913a20f4aaa09749928b56740cbf774a631f79ca52bb8ba337be874d88f
- Create Program 1: 0xd4f894567e91724295d9b736d15c7aa10bbf0657c51b622984f52e29d8548e40
- Attach report: 0xc4e805ea0596ca7e977288e9d787478c136d5cc147e12a3b9198d5c6918263e4
- Attest report: 0x07cfa6c166de1a4525b3999e161a28eaa952e652c5ec391b92dd332c0f1d43a1
- Case 1 provisional submission: 0x944cdc05076e676835db2bf005122bf71a2e54f0617e30f70bffa084c7337bc0
- Case 1 review: 0x5ce39c1f51008435c1c9e3ddf9bbd5d6c1acb80afb202aedcd2b73277c7989cd
- Case 2 submission: 0x18dbc5e044801d62f0aad7bfce1547617a8dcbbf095a34bce217b569627db52c
- Case 3 submission: 0xb5fa49abe77ec104909036c697a61e7a4e3354c7b920e3497c903cc58fc8a805
- Case 2 resolution: 0xfc46cefe422201ea9d22960214a0821a8556701bd06fcc6f57e2fb4d40ab8437
- Case 3 resolution: 0x4b6742bcc6fbb8ef5372d6e673a362bef2cdabaf4f6a667a26c8455cd8a84c44
- Case 3 award: 0x3b98e7c024b7766494473113cfb41ba7bd85eada13c6242967ccafa55cfb6148
- Sepolia receipt: https://sepolia.etherscan.io/tx/0xdacd7b2f146f69dfe2c8f8296e63c7a0176ed5095efa66cd751bd6f4401cb809

Reported live results from finalized calls and read methods:
- Case 1: UNVERIFIABLE, 0 credits, subsequently CANCELLED_UNVERIFIABLE.
- Case 2: DENIED / INELIGIBLE.
- Case 3: APPROVED / ELIGIBLE, then CLAIMED, returned 100 demo credits.
- Program 1: submitted=3; approved=1; claimed=1; max_claims=1.
- Both Cases 2 and 3 reference the same Sepolia receipt; Case 2 was submitted first.

Scope: synthetic incident drill only; no insurance contract, assets held or real-world coverage. These records support an operational fix of the two previously reported claim admission issues on the selected new contract. They do not constitute a full security audit.

Additional readback and rejected repeat claim (24 Oct 2026): wallet B's `get_demo_balance(0xD6b8A3A5eB329410D9504784812b8569afA8C2aF)` returned `100`. A second `claim_demo_award(3)` transaction reached FINALIZED with an expected ERROR / rollback `No unclaimed approved award` across all five agreeing validators. This verifies exactly-once demo-credit redemption and no second payout. The denied repeat claim's full TX is [0xd2c2187109e279a29e237bae0515c84090d8bc1b508875cf4f2f52773886c965](https://explorer-studio.genlayer.com/tx/0xd2c2187109e279a29e237bae0515c84090d8bc1b508875cf4f2f52773886c965); the screenshot shows FINALIZED / ERROR with five validators agreeing on rollback `No unclaimed approved award`.

Still pending: precise cancellation TX link for Case 1; optional separate live cross-program receipt-replay demonstration. Cross-program replay has automated test coverage only, not live chain evidence yet.
