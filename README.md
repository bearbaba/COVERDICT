# COVERDICT

**AI-consensus adjudication of narrowly defined DeFi incident claims — with auditable, wallet-bound demonstration awards.**

> **STATUS: STUDIONET POSITIVE SYNTHETIC CLAIM APPROVED + AWARDED / NOT AUDITED / NOT MAINNET SAFE.** No real insurance, escrow, real monetary compensation or token transfers. An on-chain transaction proves a transfer, **not** an economic loss. The demo award is a non-transferable, non-redeemable virtual number with no value. Do not deposit or risk funds using this contract.

## Why this exists

When a DeFi protocol experiences a vulnerability, reimbursement programs have two separate questions: **what happened** (incident scope) and **which submitted wallet receipts fall within agreed terms**. COVERDICT is a narrowly scoped, programmable claims *adjudication* experiment. It combines deterministic transfer-receipt tests with an AI-verifiable issuer incident report and an immutable policy. An independently reproduced GenLayer consensus result changes a wallet's eligibility to claim a **demo-credit** award.

COVERDICT is **not** a production insurance, loss oracle or decentralized guarantee. It **does not** independently prove economic loss. It is distinct from milestone acceptance projects because the consequence concerns an incident program and wallet-specific transaction eligibility; this distinction still requires genuine positive-decision validator traces, adversarial claim results and an independently usable frontend for a strong Projects submission.

## v0.2 testnet-hardening lifecycle

1. **Issuer precommits a program** before the incident window: affected Sepolia testnet receiving address, future bounded incident window, claim cutoff, immutable GitHub commit-pinned policy and SHA256 digest, fixed demo award size, fixed maximum claims. The immutable policy may not be replaced.
2. **Issuer pins an incident report** only after the incident window. Report source is a single raw file from a specific `bearbaba/COVERDICT` GitHub commit with an exact SHA256. This is an issuer-authored statement, **not** independent authentication or official incident proof.
3. **Claimant submits exactly one Sepolia testnet transaction hash**, with their connected GenLayer wallet bound as the claimant address. Each transaction hash can be used only once per program. This MVP accepts **direct native test-ETH transfers on Ethereum Sepolia only**; ERC20, real-world loss, DeFi shares, cross-chain receipts, internal transfers and purported loss totals are deliberately unsupported.
4. **GenLayer validators independently fetch** the hashed policy/report and public Blockscout transaction. Deterministic checks require success, positive native ETH, matching `from`/`to`, and the pinned timestamp interval. The AI evaluates whether the issuer's incident report explicitly qualifies under the simulated program terms; validators run the same assessment independently, then compare both the verdict and normalized source fingerprint.
5. A terminal **ELIGIBLE** verdict marks a claim `APPROVED`, enabling the connected claimant to call `claim_demo_award(case_id)` exactly once. **INELIGIBLE** marks `DENIED`; **UNVERIFIABLE** stays `SUBMITTED`, without inventing a rejection, and may be retried after 600 seconds. Claims remaining unresolved after the 7-day grace following the submission deadline can be closed as CLOSED_UNVERIFIABLE without minting credits. Award capacity is bounded by `max_claims * award_credits` (all synthetic; no banked funds).

### Contract ABI (v0.1)

```text
create_program(label, deposit_contract, incident_start, incident_end,
               claim_deadline, policy_url, policy_sha256,
               award_credits, max_claims) -> program_id
attach_report(program_id, report_url, report_sha256)
submit_claim(program_id, tx_hash) -> case_id
resolve_claim(case_id) -> status
claim_demo_award(case_id) -> credits
close_unverifiable_claim(case_id) -> CLOSED_UNVERIFIABLE (after deadline + 7 days)

get_program(program_id), get_case(case_id), get_program_count(),
get_case_count(), get_demo_balance(wallet)
```

**Do not send real ETH to test COVERDICT.** Use Sepolia faucet test-ETH only; current contract validates only simulated eligibility and cannot prove financial loss. **Do not publish production coverage terms in this version.** Repository `evidence/` files are synthetic placeholders for the test harness only; they must not be presented as true incident attestations.

## Evidence trust boundary

Policy and report URLs must match: `https://raw.githubusercontent.com/bearbaba/COVERDICT/<40-hex-commit>/evidence/<filename>.txt`. Contract SHA256 checks detect changed bytes. For receipts, the resolver constructs the exact `https://eth-sepolia.blockscout.com/api/v2/transactions/<64-hex-hash>` URL: claimants cannot inject arbitrary API hosts or query parameters. GenLayer validator **re-fetches all three sources** and independently computes a stable fingerprint.

This is **not proof** that a source issuer is independent, accurate, or legally authorized to determine coverage. Blockscout is a single data provider with no SPV proof in this version. The LLM can still be wrong even with independent validators. The separate [SECURITY.md](SECURITY.md) lists production blockers.

## Local checks

```bash
python -m pip install -r requirements-dev.txt
python -m py_compile contracts/Coverdict.py
python -m pytest -q tests/
cd web
npm install
npm run build
```

Tests use shimmed GenLayer globals and mocked web/LLM responses; they **do not** prove GenVM runtime support, network accessibility, security or independent validator correctness on a live network.

## Studionet deployment evidence (2026-10-21)

- Contract address: `0x044DB5B1d148d30f8EdF591497d8726F66C22a16` ([Studio import](https://studio.genlayer.com/?import-contract=0x044DB5B1d148d30f8EdF591497d8726F66C22a16)).
- Deployment transaction: `0xf2d167a4c30bac322dcfeb2145cc157380a015fe043cfecbd82a150498afe045` ([deployment receipt](https://explorer-studio.genlayer.com/tx/0xf2d167a4c30bac322dcfeb2145cc157380a015fe043cfecbd82a150498afe045)).
- User-supplied Studio screenshot displays **Normal (Full Consensus)**, `Contract deployed`, and `FINALIZED`. Deployment source parity and the original positive AI decision's transaction/validator traces are **still pending**. User-provided accepted contract reads now demonstrate a positive synthetic claim lifecycle (see [ACCEPTANCE.md](ACCEPTANCE.md)).
- This deployment corresponds to the `fix/testnet-readiness` variant with the `close_unverifiable_claim` method visible in Studio. The exact deployed source still needs independent comparison with the branch.
- Use only Sepolia test-ETH as synthetic receipt data; no financial compensation is available.

## Public Testnet website

- **Canonical domain:** [https://coverdict-testnet.vercel.app](https://coverdict-testnet.vercel.app) (Vercel Vite Production deployment **READY**, Git-connected to `main`).
- **Deployment dashboard:** [Vercel deployment](https://vercel.com/khaiptk1998-8088s-projects/coverdict-testnet/3yPszcPpNKwcnYUPPdFCMwSV7irT).
- Build-time address: `VITE_COVERDICT_CONTRACT_ADDRESS=0x044DB5B1d148d30f8EdF591497d8726F66C22a16`, GenLayer Studionet. Authentication/password protection disabled for public demo.
- **Browser acceptance still pending**: GitHub/Vercel confirm successful build, but independent anonymous browser access, wallet connection and write flows have not been confirmed in this environment. The site offers only nonredeemable test credits; do not submit real funds or claim any insurance coverage.

## Web app / deployment

Frontend is a responsive React + Vite English-first app with public read-only claim explorer, paginated wallet history, pinned evidence links and fingerprints, issuer controls, demo-credit claim and explorer-linked browser transaction history. It labels all programs as synthetic testnet simulations. It **does not** fabricate markets while no contract is deployed. For deployment, set the public build-time environment variable `VITE_COVERDICT_CONTRACT_ADDRESS=0x044DB5B1d148d30f8EdF591497d8726F66C22a16` (or use `web/.env` locally). Do not publish credentials. The bundled frontend client currently targets **Studionet 61999**; change its network definition and validate chain IDs before moving to Bradbury. Vercel settings: root `web`, framework Vite, output `dist`.

Recommended development route: **local GenVM lint & tests → Studionet independent consensus → Bradbury public testnet → steward-reviewed Projects submission → security, oracle, legal and real partner validation → eventual Mainnet deployment when available and justified.** The user supplied accepted reads for one synthetic claim with `ELIGIBLE → APPROVED → CLAIMED`, virtual wallet balance `100`, and a separate expected rollback on duplicate claim. The first **live negative Claim #2 returned DENIED/INELIGIBLE**, with 0 demo award and a [FINALIZED SUCCESS receipt](https://explorer-studio.genlayer.com/tx/0x08dc22aca05271cbf270b1362248d89b95f52b06cbb040aac56d69c9011ba50a). Claim #3 now reports `UNVERIFIABLE / SUBMITTED` with empty evidence digest and zero authorized demo credits in a user-provided Studio read; see [PROGRAM_03.md](PROGRAM_03.md). Original positive adjudication trace, Case #3 original resolution receipt and validator traces, (now verified) wallet C post-resolution balance 0 via [independent RPC](https://github.com/bearbaba/COVERDICT/actions/runs/39733374513), and independent browser acceptance remain outstanding.

## Repository

- `contracts/Coverdict.py` — GenLayer Intelligent Contract, independent AI evaluation and demo-credit authorization.
- `tests/test_coverdict.py` — adversarial logic tests (local shim only).
- `web/` — TypeScript + React wallet UI; deployment gated by environment.
- `evidence/` — **synthetic reference templates**, not real incident proof.
- `ACCEPTANCE.md` — observed Studionet proof matrix, links, limitations and remaining checks.
- `NEGATIVE_STUDIO_TEST.md` — verified live DENIED / INELIGIBLE case and award-rollback evidence.
- `UNVERIFIABLE_STUDIO_TEST.md` — verified Blockscout HTTP 404 and observed live UNVERIFIABLE Case #3, including remaining acceptance evidence.
- `ROADMAP.md` — go/no-go gates and Mainnet risk controls.
- `REVIEWER.md` — on-chain reproduction and submission checklist.
- `SECURITY.md` — trust limitations and mainnet release blockers.
- `.github/workflows/ci.yml` — Python contract checks and web build.

## Relevant GenLayer references

- [Equivalence Principle](https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle)
- [Network Configuration](https://docs.genlayer.com/developers/intelligent-contracts/deploying/network-configuration)
- [Deploying Intelligent Contracts](https://docs.genlayer.com/developers/intelligent-contracts/deploying)
