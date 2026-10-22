# COVERDICT Program #3 — Missing Proof Test

Status: Policy committed before incident. Program creation on Studionet is NOT yet confirmed.

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

To be accepted, create_program must execute at least 15 minutes before incident start. This schedule requires signing and finalization before 12:30 ICT. Record the created program ID; do not assume it is always 3.

## Next steps

After 12:47 ICT, publish a NEW issuer-written synthetic report in evidence/demo_program_03_report.txt. Pin the final Git commit and calculate the report SHA256. Do not commit the finalized report earlier.

Wallet A then calls attach_report(program_id, report_url, report_sha256) on Studionet.

Wallet C: 0x60Bfdf6315294c7856Acdc0B80D7Bd40217DEBff (initial demo balance 0 from user Studio read).

Wallet C then submits an intentionally missing Sepolia hash on the new OPEN_FOR_CLAIMS program:
0x0000000000000000000000000000000000000000000000000000000000000001

Blockscout independently returned 404 for this hash. After a successful submit, use the actual case ID to call resolve_claim. Expected case state: UNVERIFIABLE, SUBMITTED, attempts=1, award_credits=0, claimed=false, evidence_digest empty; wallet C balance unchanged.

The test is synthetic. There is no alleged real exploit or financial loss and no redeemable award.
