# COVERDICT Program #3 — Missing Proof Test

## Latest on-chain acceptance — Case #3: UNVERIFIABLE (2026-10-22)

**Live verdict observed from user-provided Studio state: PASS.** The user supplied a finalized state read of `get_case(3)`: `status=SUBMITTED`, `outcome=UNVERIFIABLE`, `attempts=1`, `last_attempt_at=1792649868`, `award_credits=0`, `claimed=false`, `evidence_digest=""`. The claimant is wallet C `0x60bfdf6315294c7856acdc0b80d7bd40217debff`, under Program #3, using the deliberately absent Sepolia hash `0x0000000000000000000000000000000000000000000000000000000000000001`. Reason: `One or more pinned evidence sources could not be independently verified.`

The missing Sepolia receipt previously returned HTTP 404 in a [read-only Blockscout API test](https://github.com/bearbaba/COVERDICT/actions/runs/39724530282). Unknown proof was **not** converted to `DENIED` or `APPROVED`; the case remains retryable after the contract's 600-second cooldown and carries no authorized demo award.

**Evidence boundary:** the original `submit_claim(3)` and `resolve_claim(3)` transaction hashes and individual validator traces have **not yet been provided**. A state read is not the same as a finalized execution receipt. [Independent read-only RPC acceptance](https://github.com/bearbaba/COVERDICT/actions/runs/39733374513) now confirms wallet C's **post-resolution demo balance is still 0**, `get_case(3)=SUBMITTED / UNVERIFIABLE` with 0 authorized award, and Program #3 counters `submitted=1`, `approved=0`, `claimed=0`.

Sections below preserve historical milestones and planned steps; use this latest status rather than any older statement saying Case #3 is pending.


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

## Official post-window report — published 2026-10-22 after 12:47 ICT

The synthetic incident window ended at 12:47 ICT. The report was committed to GitHub after that time. This is an issuer-authored test declaration, **not a real exploit or loss attestation**.

- Git report commit: `4b6737cab3b7ecec5f642d14779aeb575c024127`
- [Immutable report source](https://github.com/bearbaba/COVERDICT/blob/4b6737cab3b7ecec5f642d14779aeb575c024127/evidence/demo_program_03_report.txt)
- Raw URL: `https://raw.githubusercontent.com/bearbaba/COVERDICT/4b6737cab3b7ecec5f642d14779aeb575c024127/evidence/demo_program_03_report.txt`
- Verified SHA256: `8799473f94f80b3a171621ec069f6d7741d5e2d07e4036380aebcb00ac66f9da`
- Exact source: 1918 ASCII bytes, trailing LF; SHA256 independently recomputed from immutable GitHub file.

**Still pending on-chain:** only the issuer wallet A can sign `attach_report(3, raw_url, sha256)`. Confirm FINALIZED/SUCCESS and then `get_program(3).status=OPEN_FOR_CLAIMS` with pinned report fields. Do not assume the report is already attached simply because it exists on GitHub.

**Next user-controlled write:** wallet C `0x60Bfdf6315294c7856Acdc0B80D7Bd40217DEBff` calls `submit_claim(3, "0x0000000000000000000000000000000000000000000000000000000000000001")` before 13:30 ICT. This is a nonexistent receipt verified by Blockscout HTTP 404, so the correct expected consensus result is UNVERIFIABLE. Read actual returned case ID rather than assume #3.


## Live report attachment confirmed through GenLayer Studionet RPC

On October 22 2026 the independent GitHub Actions [read-only Studionet smoke #39730640013](https://github.com/bearbaba/COVERDICT/actions/runs/39730640013) successfully read:

- `get_program(3).status=OPEN_FOR_CLAIMS`.
- `get_program(3).report_sha256=8799473f94f80b3a171621ec069f6d7741d5e2d07e4036380aebcb00ac66f9da`.
- `get_program(3).report_url=https://raw.githubusercontent.com/bearbaba/COVERDICT/4b6737cab3b7ecec5f642d14779aeb575c024127/evidence/demo_program_03_report.txt`.
- Submitted 0, approved 0 at time of this read, and prior cases unchanged.

**Report attachment independently VERIFIED on-chain.** Original `attach_report(3,...)` transaction hash and detailed validator votes have not been provided; do not invent them.

**Next live test:** wallet C `0x60Bfdf6315294c7856Acdc0B80D7Bd40217DEBff` calls `submit_claim(3, "0x0000000000000000000000000000000000000000000000000000000000000001")` **before 13:30 ICT October 22**. Then read `get_case_count` or returned ID and call `resolve_claim(case_id)`; expectation is `UNVERIFIABLE`, not `DENIED` or `APPROVED`.

### Confirmed independent Case #3 RPC result

[GitHub Actions #39733374513](https://github.com/bearbaba/COVERDICT/actions/runs/39733374513) independently read the live Studionet contract after Case #3 resolved: program count 3, claim count 3; Program #3 submitted 1, approved 0; `get_case(3)=SUBMITTED / UNVERIFIABLE` with award 0; wallet C balance **0**; wallets A/B **100 / 0**. The job passed. This establishes persisted state and no demo-credit award, **not** the original resolution transaction receipt or individual validator votes (still pending).
