# COVERDICT Program #2 — Morning Sepolia Drill

**Prepared, not yet created on-chain.** This program replaces the proposed *test schedule*, not Program #1. Program #1 keeps its immutable 14:00–15:00 ICT interval.

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
