# COVERDICT — real Studionet acceptance runbook (Sepolia test-ETH)

> **DO NOT SEND REAL ETH, USDC, GEN OR OTHER FINANCIAL ASSETS.** This is a demo-credits-only claim eligibility experiment. A direct test-ETH transfer proves an on-chain payment, **not** a DeFi loss, insurance claim or fraud reimbursement.

## Scope and contract versions

- This checklist applies to the **unmerged** `fix/testnet-readiness` code, not to the previous version on `main`.
- Studionet contract imported at `0x044DB5B1d148d30f8EdF591497d8726F66C22a16` ([Studio import](https://studio.genlayer.com/?import-contract=0x044DB5B1d148d30f8EdF591497d8726F66C22a16)); user-supplied Studio screenshot shows `FINALIZED` for transaction `0xf2d167a4c30bac322dcfeb2145cc157380a015fe043cfecbd82a150498afe045` ([deployment receipt](https://explorer-studio.genlayer.com/tx/0xf2d167a4c30bac322dcfeb2145cc157380a015fe043cfecbd82a150498afe045)). Verify deployed source parity before claiming definitive code equivalence. The Full Consensus claim flow remains **UNTESTED LIVE**.
- Sepolia transaction evidence: `https://eth-sepolia.blockscout.com/api/v2/transactions/{tx_hash}`.
- On-chain GenLayer execution: hosted Studionet / Full Consensus, not leader-only.
- There is **no claims fund or promise of monetary payout**. Only fixed demo credits are minted after approval.

## Gate 0 — do not deploy until validation

```bash
python -m pytest -q tests/
genvm-lint check contracts/Coverdict.py
cd web && npm install && npm run build
```

The local shim tests are not full GenVM tests. If the linter reports SDK errors, fix them before deployment. Do not claim the engine works until a real GenLayer receipt and validator trace exist.

## Gate 1 — prepare an immutable synthetic coverage policy

1. Prepare an issuer-defined policy in the project's `evidence/` folder **before** the chosen future incident interval. Make the policy say exactly what is covered, what is excluded, which chain, who can submit, how much demo-credit award is authorized, and the date interval. Do not imply real harm or insurance.
2. Commit the file to GitHub, capture the **full 40-character Git commit SHA**. Construct `https://raw.githubusercontent.com/bearbaba/COVERDICT/{commit}/evidence/{file}.txt`. Only use this exact repo/path shape.
3. Compute the file's exact UTF-8 SHA256. On Windows PowerShell: `Get-FileHash evidence\\demo_policy.txt -Algorithm SHA256`. On bash: `sha256sum evidence/demo_policy.txt`.
4. Choose the recipient as a **Sepolia wallet you control**, rather than a deployed DeFi vault. Choose a future incident window and a claims submission deadline: `incident_start > now + 900 seconds`, `incident_start < incident_end < claim_deadline`, and `claim_deadline < now + 30 days`.
5. Call `create_program(label, deposit_contract, incident_start, incident_end, claim_deadline, policy_url, policy_sha256, award_credits, max_claims)`. Set award_credits and max_claims small. Save the finalized SUCCESS transaction and `get_program(1)`.

## Gate 2 — prepare **testnet** receipt and pinned report

1. Only after the chosen `incident_start`, send a **small quantity of Sepolia faucet test-ETH** from the same wallet address you will connect to GenLayer, to the committed `deposit_contract` address. Use a separate recipient address; never send tokens to the COVERDICT contract itself.
2. Confirm the recipient, `from`, amount, successful status and UTC timestamp on Sepolia Blockscout. The response's `hash` must equal the submitted tx hash. If the source differs, the claim should remain `UNVERIFIABLE`, never be approved.
3. After `incident_end`, publish a **clearly labeled simulated incident report** in `evidence/`, commit it and pin the exact raw-file URL + SHA256. This is an issuer-authored report, not independent loss proof.
4. From the program issuer wallet, call `attach_report(program_id, report_url, report_sha256)`. Save finalized SUCCESS receipt. The report may not be replaced.
5. Before `claim_deadline`, from the **same GenLayer address as Sepolia sender**, call `submit_claim(program_id, tx_hash)`. Record `case_id`.

## Gate 3 — prove genuine GenLayer consensus

1. Execute `resolve_claim(case_id)` in **Normal / Full Consensus**. Check both *consensus state* and *execution result*; `ACCEPTED + ERROR` is not success.
2. Capture all leader and validator traces, the evidence SHA256 fingerprint and `get_case(case_id)` after FINALIZED. Show that the final verdict changes the claim's status and authorization.
3. Record an approved scenario (`ELIGIBLE → APPROVED`), an explicitly excluded scenario (`INELIGIBLE → DENIED`), and missing/mismatched source (`UNVERIFIABLE → SUBMITTED`). Do not fabricate answers or force LLM outputs in the real demo.
4. As the approved claimant, call `claim_demo_award(case_id)` **once**. Verify `get_demo_balance(wallet)` increases and `get_case(case_id).claimed` is true. Repeat and show second claim fails.
5. Test the terminal inconclusive outcome `CLOSED_UNVERIFIABLE` after `claim_deadline + 7 days` on an accelerated disposable test chain; **do not claim a real seven-day live observation without actual evidence**.

## Gate 4 — web and reviewer evidence

- Deploy HTTPS frontend to Vercel only after verified contract deployment. Set `VITE_COVERDICT_CONTRACT_ADDRESS` to the new address; Vite root directory `web`, build `npm run build`, output `dist`.
- Verify that issuer / claimant / unrelated wallet see only permitted actions; the **My Claims** page currently scans the newest 30 global cases and is not a complete indexed history. Add wallet-indexed paging before production.
- Preserve: deploy tx, program tx, report tx, claim submit tx, resolution tx, reward-claim tx, validator logs, current state reads, UI URL, unedited video.
- **Do not submit as proof of actual exploit loss.** Explain precisely that the MVP demonstrates deterministic Sepolia receipt checks + AI appraisal of an issuer-defined synthetic incident policy.

## Production gaps (Mainnet blockers)

The MVP relies on a **single Blockscout API** and **issuer-authored report**. It does not authenticate economic loss or incident causation. A future real claims engine requires authentic source attestations, loss/event indexing, fund authorization, formal dispute/appeal rules, non-Sybil claimant policies, audit and legal review. A strong GenLayer Projects submission should make this boundary explicit.

## Observed on-chain evidence (fill only after genuine finalization)

| Checkpoint | Status | Explorer URL or screenshot |
| --- | --- | --- |
| GenVM lint | PASS in CI | [Verified workflow](https://github.com/bearbaba/COVERDICT/actions/runs/39638135874) |
| Deployed contract | FINALIZED per Studio screenshot; source parity pending | [deployment receipt](https://explorer-studio.genlayer.com/tx/0xf2d167a4c30bac322dcfeb2145cc157380a015fe043cfecbd82a150498afe045) |
| Program created | **Program #1 accepted read; create tx hash pending** | User-supplied `get_program(1)` output: awaiting report, pool empty, hashes/times match [specification](PROGRAM_01.md) |
| Incident report pinned | **Program #2 OPEN_FOR_CLAIMS; report committed SHA256 and read back** | [Program #2](PROGRAM_02.md) |
| Sepolia receipt verified | **Testnet Etherscan SUCCESS provided; GenLayer returned ELIGIBLE, validator traces pending** | [Program #2](PROGRAM_02.md) |
| Full Consensus APPROVED/DENIED | **Claim #1 APPROVED / ELIGIBLE via get_case(1) read; resolve tx and validator traces pending** | [Program #2](PROGRAM_02.md) |
| UNKNOWN / source mismatch | PENDING | — |
| Claim award once | **`get_case(1)` shows CLAIMED/claimed=true; demo balance and replay negative test pending** | [Program #2](PROGRAM_02.md) |
| HTTPS frontend | PENDING | — |

### Immediate next step after deployment

1. In [Studio import](https://studio.genlayer.com/?import-contract=0x044DB5B1d148d30f8EdF591497d8726F66C22a16), call `get_program_count()` and `get_case_count()`. Log both accepted reads and ensure new instance has no old program/case state.
2. Gather a **separate recipient Sepolia address controlled by the tester** and verify the claimant wallet can sign on both GenLayer Studionet and Ethereum Sepolia. Do not assume the COVERDICT contract address is the receipt destination.
3. Before creating the program, commit a synthetic policy that explicitly identifies the test program, deposit address, complete time window and cover/exclusion semantics. Hash exact UTF-8 bytes and use a full 40-hex commit-pinned raw URL. Do not use examples as evidence of a genuine exploit.
4. Only then create the future-dated program; do not submit an incident report before `incident_end`.
