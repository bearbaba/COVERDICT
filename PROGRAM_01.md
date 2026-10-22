# COVERDICT Program #1 — synthetic Sepolia acceptance case

> **Prepared, NOT yet created on-chain.** The only verified on-chain state so far is the deployer's Studio read of `get_program_count() = 0` and `get_case_count() = 0`, both reported Accepted. The developer must not describe Program #1 as created before a successful transaction and follow-up state read.

## Purpose

Validate one bounded issuer-defined simulation in which two GenLayer validators independently assess a SHA256-pinned policy, a later pinned synthetic report, and an actual Ethereum Sepolia *test-ETH* transaction receipt. The claim authorizes only nonredeemable demo credits; a direct test-ETH payment is **not** proof of real-world exploit loss.

## Precommitted policy

- Pinned Git commit: `3f71dbfb415cd066e7702ea412622f17d64122c7`
- Policy: `https://raw.githubusercontent.com/bearbaba/COVERDICT/3f71dbfb415cd066e7702ea412622f17d64122c7/evidence/demo_program_01_policy.txt`
- File SHA256 (exact 2,060-byte UTF-8 content): `12e49cd768304933d80ff9b03b8805c583be18d6b47ef50bcb9a6b62f0f71392`
- Sepolia recipient: `0xD6b8A3A5eB329410D9504784812b8569afA8C2aF` (previously used as wallet B; **confirm control/authorization before sending faucet test-ETH**).
- Expected claimant/sender is the deployer's wallet `0x4C7cb73aC8F8999af21cfc9fF4cF2333a9508Dcb`, provided the user can sign on both GenLayer and Sepolia.

## Create Program #1 in Studio

Contract: `0x044DB5B1d148d30f8EdF591497d8726F66C22a16`

```text
create_program
label = Sepolia synthetic deposit drill #1
deposit_contract = 0xD6b8A3A5eB329410D9504784812b8569afA8C2aF
incident_start = 1792652400
incident_end = 1792656000
claim_deadline = 1792738800
policy_url = https://raw.githubusercontent.com/bearbaba/COVERDICT/3f71dbfb415cd066e7702ea412622f17d64122c7/evidence/demo_program_01_policy.txt
policy_sha256 = 12e49cd768304933d80ff9b03b8805c583be18d6b47ef50bcb9a6b62f0f71392
award_credits = 100
max_claims = 10
```

Timeline (Asia/Ho_Chi_Minh / ICT, UTC+7):
- Incident begins: **2026-10-22 14:00** (07:00 UTC)
- Incident ends: **2026-10-22 15:00** (08:00 UTC)
- Claim submission closes: **2026-10-23 14:00** (07:00 UTC)

**Transaction plan:**
1. Confirm both program/case counts were 0 on fresh deployment (user-reported).
2. Before 14:00 ICT on Oct 22, create program with precisely the values above and record FINALIZED+SUCCESS and `get_program(1)`. If this preparation window is missed, do not backdate or reuse the already-expired policy; create a new precommitted policy with future times.
3. Between 14:00 and 15:00 ICT, send **small Sepolia faucet test-ETH** from the intended claimant's same address to the intended authorized recipient; never send actual mainnet ETH or anything to the COVERDICT contract address. Record the Sepolia tx hash, receipt and UTC timestamp.
4. Only after 15:00 ICT, commit a report labeled **synthetic simulation**. It must describe the same program, recipient, and incident class, and must not falsely assert a real DeFi hack. Compute SHA256 and call `attach_report` from the program issuer.
5. Before 14:00 ICT on Oct 23, `submit_claim(program_id=1, tx_hash)` from that claimant. `resolve_claim` and `claim_demo_award` are GenLayer calls, not Sepolia transactions. Capture leader/validator traces, receipt and final wallet-specific balance.
6. Test negative or unavailable evidence separately and honestly; never force a favorable LLM decision for the public reviewer.

**Status:** Source pinned. Program creation, receipt, incident report, Full Consensus verdict, claim, and UI are PENDING.
