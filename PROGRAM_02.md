# COVERDICT Program #2 — Morning Sepolia Drill

**ON-CHAIN CREATED / READ VERIFIED BY USER, 2026-10-22.** Program #2 was created on GenLayer Studionet; the user supplied a read result confirming matching on-chain fields and the creation transaction hash `0x3742313c03a2ef541e961ef642874e5e34c5becd3501b5c2276f9c7e9429e46a`. The explorer receipt is not yet independently machine-verified. This program replaces the proposed *test schedule*, not Program #1. Program #1 keeps its immutable 14:00–15:00 ICT interval.

## Immutable policy (precommitted before event)

- Committed before the 09:20 ICT event: `8dcbe358fcecb9c2a020428fda002df4f7dac20e`.
- [Pinned raw policy](https://raw.githubusercontent.com/bearbaba/COVERDICT/8dcbe358fcecb9c2a020428fda002df4f7dac20e/evidence/demo_program_02_policy.txt).
- Verified original policy bytes: ASCII/UTF-8, 992 bytes, trailing LF.
- SHA256: `3aecb23e16be10a42f929442ee928850c653a170da3d8aace136e38b579183bc`.
- Recipient: `0xD6b8A3A5eB329410D9504784812b8569afA8C2aF` on **Ethereum Sepolia** only. Confirm this is a permitted / controlled wallet address before sending test-ETH.
- Intended claimant: `0x4C7cb73aC8F8999af21cfc9fF4cF2333a9508Dcb`, provided the wallet can sign from this same address on both networks.
- Start: 2026-10-22 **09:20 ICT** / 02:20 UTC, Unix `1792635600`.
- End: 2026-10-22 **09:30 ICT** / 02:30 UTC, Unix `1792636200`.
- Claim deadline: 2026-10-22 **12:00 ICT** / 05:00 UTC, Unix `1792645200`.
- Award: 100 virtual nonredeemable credits, maximum 10 claims.

## Studio create_program input

```text
label = Sepolia synthetic deposit drill #2
deposit_contract = 0xD6b8A3A5eB329410D9504784812b8569afA8C2aF
incident_start = 1792635600
incident_end = 1792636200
claim_deadline = 1792645200
policy_url = https://raw.githubusercontent.com/bearbaba/COVERDICT/8dcbe358fcecb9c2a020428fda002df4f7dac20e/evidence/demo_program_02_policy.txt
policy_sha256 = 3aecb23e16be10a42f929442ee928850c653a170da3d8aace136e38b579183bc
award_credits = 100
max_claims = 10
```

**Contract enforces** `incident_start >= now + 900` seconds. Program must be submitted far enough ahead of 09:20; otherwise it will fail. Do not create an on-chain program with already-stale deadlines or send test-ETH outside the window. If the clock has advanced too far, prepare a **new** Git-pinned policy and a new future window.

## Real test sequence

1. On GenLayer Studionet, call `create_program` with the exact inputs. After transaction FINALIZED+SUCCESS, call `get_program(2)`. It should be `AWAITING_INCIDENT_REPORT`, zero submitted claims. Record transaction hash.
2. Between 09:20 and **before** 09:30 ICT, send a very small amount of *Sepolia faucet test-ETH* from the claimant address to the pinned permitted recipient. Verify success and timestamps in Sepolia Blockscout. No mainnet ETH.
3. After 09:30 and before noon, publish an explicitly labeled synthetic incident report, freeze via commit SHA and SHA256; issuer calls `attach_report(2, report_url, sha256)`.
4. Claimant calls `submit_claim(2, sepolia_tx_hash)` before 12:00. Any account may call `resolve_claim(case_id)` in **GenLayer Full Consensus**. Confirm validator traces, state, output `APPROVED / DENIED / UNVERIFIABLE`, not just consensus status.
5. If `APPROVED`, only the claimant calls `claim_demo_award(case_id)` once. Record resulting virtual credit balance, repeated claim rejection. Do not imply financial loss.

**Unknowns:** on-chain Program #2 creation, Blockscout GenVM accessibility, LLM verdict, reward claim and website have **not** been verified yet.

## Claim #1 submitted — on-chain state read (2026-10-22 09:38 ICT)

User provided `get_case(1)` showing: `id=1`, `program_id=2`, `claimant=0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb`, `tx_hash=0xb7e186434d67e72c8e42c8eac3a60a3a45be7b5391245fb3668fe3ade125143a`, `status=SUBMITTED`, `attempts=0`, `claimed=false`, `award_credits=0`, `outcome=""`, `reason=""`, `evidence_digest=""`. Submission TX hash has not yet been provided. **No AI adjudication has occurred.** Next action on Studionet: `resolve_claim(1)` in Normal / Full Consensus; after FINALIZED+SUCCESS, call `get_case(1)` and preserve leader and validator traces.

## Sepolia evidence received (user-provided Etherscan transaction summary)

- Receipt hash: `0xb7e186434d67e72c8e42c8eac3a60a3a45be7b5391245fb3668fe3ade125143a` ([Etherscan Sepolia transaction](https://sepolia.etherscan.io/tx/0xb7e186434d67e72c8e42c8eac3a60a3a45be7b5391245fb3668fe3ade125143a)).
- User provided: **Success**; block **11966554**; sender `0x4C7cb73aC8F8999af21cfc9fF4cF2333a9508Dcb`, recipient `0xD6b8A3A5eB329410D9504784812b8569afA8C2aF`, transferred **0.001 Sepolia test-ETH**.
- Independent Blockscout API fetch was **unavailable from the review environment**; precise UTC timestamp and the exact `status/hash/value` fields used by the GenLayer contract are still unverified. Therefore do **not** claim validator or receipt success yet.
- SHA256 of the exact precommitted 992-byte policy was recomputed locally and matches the program state (`3aecb23e16be10a42f929442ee928850c653a170da3d8aace136e38b579183bc`).
- Next action: after **09:30 ICT / 02:30 UTC**, pin and attach a clearly labeled **synthetic** incident report from the issuer, before the program deadline at **12:00 ICT**. No evidence of actual financial damage is asserted.

## Synthetic incident report pinned after the window (2026-10-22)

- Report Git commit: `ccd7c2c7123c755c8839ef6957e918c4e25877b3`
- Immutable raw URL: `https://raw.githubusercontent.com/bearbaba/COVERDICT/ccd7c2c7123c755c8839ef6957e918c4e25877b3/evidence/demo_program_02_report.txt`
- SHA256 of 1,418 exact UTF-8 bytes with trailing LF: `6bf4d0b0ff74a2d2dbc9dec8ed4e97c3ac072962e960f68da412af9807815261`
- The report is **issuer-authored synthetic drill content**, not independent proof of a real DeFi hack or actual loss. The report must not be treated as an objective receipt; the contract checks the Sepolia Blockscout receipt independently.
- **User-reported on-chain verification:** `get_program(2)` now returns `status=OPEN_FOR_CLAIMS`, `report_url=https://raw.githubusercontent.com/bearbaba/COVERDICT/ccd7c2c7123c755c8839ef6957e918c4e25877b3/evidence/demo_program_02_report.txt`, `report_sha256=6bf4d0b0ff74a2d2dbc9dec8ed4e97c3ac072962e960f68da412af9807815261`, `submitted=0`, `approved=0`, `claimed=0`. A hash for the `attach_report` write was **not provided**.
- **Next on-chain action (before 12:00 ICT 2026-10-22):** Claimant `0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb` calls `submit_claim(2, "0xb7e186434d67e72c8e42c8eac3a60a3a45be7b5391245fb3668fe3ade125143a")`; then verify `get_case(1)` is `SUBMITTED`. Do not assert case #1 until actual submitted and read back.

- `attach_report(2, url, digest)` requires the program issuer address `0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb`, now at or after the window end 09:30 ICT. **Transaction and following `get_program(2)` read are still pending.**
- Then `submit_claim(2, 0xb7e186434d67e72c8e42c8eac3a60a3a45be7b5391245fb3668fe3ade125143a)` from claimant before noon, followed by a real Full Consensus `resolve_claim`.

## AI adjudication — Claim #1 approved (user-reported state read)

The user supplied `get_case(1)` after calling `resolve_claim(1)` in GenLayer Studio:

- Case: `1`, program: `2`, claimant: `0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb`.
- Sepolia receipt: `0xb7e186434d67e72c8e42c8eac3a60a3a45be7b5391245fb3668fe3ade125143a`.
- On-chain state: `status=APPROVED`, `outcome=ELIGIBLE`, `attempts=1`, `claimed=false`, `award_credits=100`.
- `last_attempt_at=1792636745` (2026-10-22 02:39:05 UTC; 09:39:05 ICT).
- Evidence digest: `1425cb02fcf2e538a897b3ae4138a15b3542ddddad2e6f83761b121a31dab3a7`.
- Verdict reason in on-chain read: "Verified receipt confirms successful nonzero direct test-ETH transfer by claimant to exact designated recipient 0xD6b8A3A5eB329410D9504784812b8569afA8C2aF within 2026-10-22T02:20:00Z-02:30:00Z window; policy and report explicitly cover this synthetic incident class with no exclusions or conflicts."
- The `resolve_claim` transaction hash, consensus execution receipt and independent validator trace have **not yet been provided**. A state read supports the final case outcome but is not a substitute for that evidence. No real exploit loss was verified.
- **End-to-end award step (user-provided state read):** `get_case(1)` now returns `status=CLAIMED`, `claimed=true`, `outcome=ELIGIBLE`, `attempts=1`, `award_credits=100`, with unchanged evidence digest. **Pending:** independent `get_demo_balance(claimant)` read, award transaction hash, and attempted second claim rejection. Do not state these are completed until evidenced. No real assets.


## Claim #1 reward settlement state (2026-10-22)

The user provided a post-`claim_demo_award(1)` `get_case(1)` read showing `status=CLAIMED`, `claimed=true`, `award_credits=100`, `outcome=ELIGIBLE`, `attempts=1`, and the same evidence digest `1425cb02fcf2e538a897b3ae4138a15b3542ddddad2e6f83761b121a31dab3a7`. This proves that the saved case's claimability flag is consumed. Still pending: `get_demo_balance(0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb)` read (expected 100 credits if previously zero), `get_program(2)` counters, claim transaction receipt, and an intentionally rejected repeat award claim. Separate `resolve_claim` transaction receipt/validator traces are not yet supplied. Test-ETH transfer is **not** proof of a real DeFi exploit loss.
