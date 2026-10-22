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
- `attach_report(2, url, digest)` requires the program issuer address `0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb`, now at or after the window end 09:30 ICT. **Transaction and following `get_program(2)` read are still pending.**
- Then `submit_claim(2, 0xb7e186434d67e72c8e42c8eac3a60a3a45be7b5391245fb3668fe3ade125143a)` from claimant before noon, followed by a real Full Consensus `resolve_claim`.
