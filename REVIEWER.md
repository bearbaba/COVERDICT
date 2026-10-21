# COVERDICT — GenLayer Projects acceptance evidence

**Current status: DEPLOYED TO STUDIONET (SCREENSHOT), REVIEW IN PROGRESS.** Studio displays a FINALIZED deployment; deployed-source parity, actual AI consensus receipt, full claim demo and HTTPS site have not yet been verified. Not submission ready.

## Concrete contested consequence

The dispute is **whether a wallet-specific transaction falls within an issuer's PRECOMMITTED synthetic reimbursement policy, given a reported incident**. A final `APPROVED` consensus outcome authorizes **only the matching claimant wallet** to mint its one-time fixed demo award; `DENIED` does not. `UNVERIFIABLE` does not substitute for proof of failure. No owner `force_approve` or editable verdict exists. No actual funds move.

Compared with a generic webpage classifier, the contract enforces wallet/transaction matching, immutable evidence policy, a bounded incident window, anti-replay and settlement authorization in code.

## Source policy

- Immutable policy and report are exact SHA256-checked files under a Git SHA, no branches, redirects assumed safe, arbitrary domains or query parameters.
- Receipt is constructed for the submitted Ethereum Sepolia testnet transaction hash using exactly one Ethereum Sepolia Blockscout REST API domain. Every validator refetches and checks objective facts before semantic judgment.
- `gl.vm.run_nondet_unsafe` validator independently reruns `self._assess`, and agrees only if both the verdict status and stable fingerprint match; no validator trusts only the output format.
- Unknown evidence leaves claim `SUBMITTED`; a new attempt is cooldown-limited. After 7 days beyond the program claim deadline, anyone can close an unresolved claim as `CLOSED_UNVERIFIABLE` without an award. This is not a denial of real-world loss.

## Submission gates

1. `python -m pytest -q tests/` and CI web build are green; run `genvm-lint check contracts/Coverdict.py` in matching GenLayer CLI release.
2. Deploy a NEW instance on stable **Studionet**, Normal (Full Consensus). Save exact contract address and FINALIZED+SUCCESS receipt.
3. Create a test program with policy **before** its incident start. Attach a test report after the window; prove issuer-only enforcement, SHA mismatch and fake URL rejection.
4. Obtain a **real Sepolia testnet direct native test-ETH transaction receipt** belonging to the claimant wallet, in the specified time/destination range. Do not fake or pretend financial loss. Do not use or send real ETH. Use only existing or deliberately prepared testnet receipts with faucet test-ETH, and disclose that transfers do not prove any exploit loss.
5. Run a resolvable report whose incident-type classification is meaningful and unambiguous. Show full leader/validator trace and final `APPROVED`/`DENIED` or `UNVERIFIABLE` state, including proof source/digest and reason.
6. Test claimant-only `claim_demo_award`, repeated award rejection, same tx reused, wrong wallet/destination and out-of-window proof. Capture full transaction hash for each state transition.
7. Deploy frontend to HTTPS, connect two wallets, confirm all visible data is live, and record an unedited walkthrough. The website MUST NOT present “insured” users or real loss as verified.
8. Correct trust boundaries or add an incident verification partner before any real payout Mainnet plan. If the steward requires a real-world loss proof rather than a simulated program, disclose the limitation and improve before submission.

## Explorer/website evidence

| Gate | State | Proof |
| --- | --- | --- |
| Source repo + contract | Started | `contracts/Coverdict.py` |
| CI | PASS on `fix/testnet-readiness` | [CI run](https://github.com/bearbaba/COVERDICT/actions/runs/39638135874) |
| GenVM lint | PASS in GitHub Actions | [CI run](https://github.com/bearbaba/COVERDICT/actions/runs/39638135874) |
| Studionet deployment | FINALIZED per user's Studio screenshot; source parity pending | [deployment receipt](https://explorer-studio.genlayer.com/tx/0xf2d167a4c30bac322dcfeb2145cc157380a015fe043cfecbd82a150498afe045) · [Studio import](https://studio.genlayer.com/?import-contract=0x044DB5B1d148d30f8EdF591497d8726F66C22a16) |
| AI leader/validator consensus | **Not tested live** | — |
| Program & case lifecycle | Shimmed local test only | `tests/test_coverdict.py` |
| Wallet award claim on-chain | **Not tested live** | — |
| HTTPS production preview | **Not deployed** | — |

**Suggested category:** Dispute Resolution (not “AI & Agents” merely because an LLM is used). This is a full application effort; submit under Projects only after completing the real contract + frontend flow. The exact awards/points are decided by GenLayer stewards, not the repository.

## Actual deployment reference (2026-10-21)

- Address: `0x044DB5B1d148d30f8EdF591497d8726F66C22a16`
- Hash: `0xf2d167a4c30bac322dcfeb2145cc157380a015fe043cfecbd82a150498afe045`
- Screenshot: Normal (Full Consensus), contract methods available, `FINALIZED` status and deployed log. A final receipt and source match should still be checked in Explorer/Studio before asserting all contract code is identical to the branch.
- Immediate next check: `get_program_count()` and `get_case_count()` from the imported contract; expect both `0` for an unused instance. This is an **expected value, not a recorded read**.
- Do not publish any fabricated program/case/claim result or present test-ETH transfer as evidence of real DeFi loss.
