# COVERDICT — real Studionet acceptance runbook (Sepolia test-ETH)

> **DO NOT SEND REAL ETH, USDC, GEN OR OTHER FINANCIAL ASSETS.** This is a demo-credits-only claim eligibility experiment. A direct test-ETH transfer proves an on-chain payment, **not** a DeFi loss, insurance claim or fraud reimbursement.

## Scope and contract versions

- This checklist applies to the **unmerged** `fix/testnet-readiness` code, not to the previous version on `main`.
- The contract has **not been deployed**. After a successful GenVM validation and Studionet deployment, write the *verified full contract address* and finalized deployment transaction hash here.
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
| GenVM lint | PENDING | No successful live GenVM check yet |
| Deployed contract | PENDING | — |
| Program created | PENDING | — |
| Incident report pinned | PENDING | — |
| Sepolia receipt verified | PENDING | — |
| Full Consensus APPROVED/DENIED | PENDING | — |
| UNKNOWN / source mismatch | PENDING | — |
| Claim award once | PENDING | — |
| HTTPS frontend | PENDING | — |
