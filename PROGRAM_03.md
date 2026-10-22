# COVERDICT Program #3 — Missing Proof Test

**ON-CHAIN CREATED AND READ VERIFIED — October 22, 2026.** User supplied `get_program(3)` and [FINALIZED, execution SUCCESS, consensus Accepted `create_program` receipt](https://explorer-studio.genlayer.com/tx/0x7686990d2f1cd1e8368d393c1f35406b2d73f8cb29f2d5fd5ed18ef074be2300). `Return Value=3`, issuer wallet A, chain Studionet 61999, initial validators 5, zero rotations, no stdout/stderr. Program #3 has `status=AWAITING_INCIDENT_REPORT`, `submitted=0`, `approved=0`, `claimed=0`; `report_url` and `report_sha256` are empty. This confirms the program creation, NOT report attachment, claim submission or GenLayer UNVERIFIABLE adjudication.

## Program definition

Issuer: wallet A, 0x4c7cb73ac8f8999af21cfc9ff4cf2333a9508dcb

Program label: Sepolia missing-proof verification drill #3

Recipient on Sepolia: 0xd6b8a3a5eb329410d9504784812b8569afa8c2af

Incident start: 1792647900 (12:45 ICT, Oct 22 2026)

Incident end: 1792648020 (12:47 ICT)

Claim deadline: 1792650600 (13:30 ICT)

Award credits: 100

Max claims: 3

Policy raw URL:
https://raw.githubusercontent.com/bearbaba/COVERDICT/64249db45a427d02f3b362553456f412866e6f12/evidence/demo_program_03_policy.txt

Verified policy SHA256:
48be0cec000526461ee631009b93023a5fe3fe3b29150bd4126c873a7eda2a54

Policy bytes: 1952 ASCII, digest verified against the commit-pinned GitHub source.

Precommit execution has now occurred: creation transaction timestamp was **12:20:28 ICT**, ahead of the 12:45 incident start (25 minutes beforehand). Program ID 3 confirmed by `create_program` return value and state read.

## Next steps

After 12:47 ICT, publish a NEW issuer-written synthetic report in evidence/demo_program_03_report.txt. Pin the final Git commit and calculate the report SHA256. Do not commit the finalized report earlier.

Wallet A then calls attach_report(program_id, report_url, report_sha256) on Studionet.

Wallet C: 0x60Bfdf6315294c7856Acdc0B80D7Bd40217DEBff (initial demo balance 0 from user Studio read).

Wallet C then submits an intentionally missing Sepolia hash on the new OPEN_FOR_CLAIMS program:
0x0000000000000000000000000000000000000000000000000000000000000001

Blockscout independently returned 404 for this hash. After a successful submit, use the actual case ID to call resolve_claim. Expected case state: UNVERIFIABLE, SUBMITTED, attempts=1, award_credits=0, claimed=false, evidence_digest empty; wallet C balance unchanged.

The test is synthetic. There is no alleged real exploit or financial loss and no redeemable award.

## Studio creation acceptance matrix

| Check | Observed |
|---|---|
| Original policy source | SHA256-pinned at commit `64249db45a427d02f3b362553456f412866e6f12` |
| `create_program` receipt | [FINALIZED, execution SUCCESS](https://explorer-studio.genlayer.com/tx/0x7686990d2f1cd1e8368d393c1f35406b2d73f8cb29f2d5fd5ed18ef074be2300) |
| Consensus | Accepted, initial validators 5, zero rotations; no individual vote trace supplied |
| Result | Return 3 |
| State read | `get_program(3)` matches pinned policy digest, fixed window and issuer |
| Claims | 0 submitted, 0 approved, 0 claimed |
| Report | Empty pending post-window commit |
| GenLayer UNVERIFIABLE | NOT YET TESTED |

### Post-window report content — draft only, not evidence yet

```text
COVERDICT PROGRAM #3 - ISSUER SYNTHETIC INCIDENT REPORT
Report Type: TESTNET SIMULATION ONLY; NOT A REAL LOSS ATTESTATION.
Program: Sepolia missing-proof verification drill #3
Simulated incident class: SIMULATED_DEPOSIT_MISROUTE_DRILL
Evidence network: Ethereum Sepolia (chain ID 11155111)
Designated Sepolia recipient: 0xd6b8a3a5eb329410d9504784812b8569afa8c2af
Incident window: 2026-10-22T05:45:00Z to 2026-10-22T05:47:00Z
Claim deadline: 2026-10-22T06:30:00Z

The issuer declares the designated recipient and the specified interval to be
within the precommitted synthetic deposit-misroute drill for Program #3.
This is an issuer-authored TESTNET SIMULATION, not a report of an actual
protocol exploit, unauthorized withdrawal, or financial loss.

Each claimant must independently provide a genuine, positive-value, successful
Ethereum Sepolia native test-ETH transfer from its own wallet to the exact
designated recipient within the fixed incident window. The pinned program
policy governs any eligibility decision; the report grants no award by itself.

A receipt that does not exist or cannot be independently checked does not
establish either eligibility or affirmative ineligibility. It is UNVERIFIABLE
until independently verifiable evidence becomes available. No financial
compensation, insurance, or redeemable credits are involved.
END OF SYNTHETIC INCIDENT REPORT
```

**This text is only a draft stored in documentation.** Publish `evidence/demo_program_03_report.txt` as a new immutable Git commit **after 12:47 ICT**, compute the exact SHA256 from that commit, then wallet A calls `attach_report(3, url, hash)` before 13:30 ICT. Do not attach or claim before the report exists.

## Independent blockchain recheck

Read-only GitHub Actions [Studionet RPC run #39727966321](https://github.com/bearbaba/COVERDICT/actions/runs/39727966321) completed SUCCESS on October 22, 2026 and observed `get_program_count=3`, `get_case_count=2`, `get_program(3)=AWAITING_INCIDENT_REPORT`, Program #3 submitted=0 and approved=0. The original Claim #1 remained CLAIMED/ELIGIBLE, Claim #2 remained DENIED/INELIGIBLE, and wallet A/B balances remained 100/0. This verification used the stable SDK without any wallet or signing; it does not imply that the post-incident report or UNVERIFIABLE case already exists.
