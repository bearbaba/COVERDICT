# COVERDICT

**AI-consensus adjudication of narrowly defined DeFi incident claims — with auditable, wallet-bound demonstration awards.**

> **STATUS: STUDIONET DEPLOYED (STUDIO SCREENSHOT) / AI CONSENSUS NOT YET TESTED / NOT AUDITED.** No real insurance, escrow, real monetary compensation or token transfers. An on-chain transaction proves a transfer, **not** an economic loss. The demo award is a non-transferable, non-redeemable virtual number with no value. Do not deposit or risk funds using this contract.

## Why this exists

When a DeFi protocol experiences a vulnerability, reimbursement programs have two separate questions: **what happened** (incident scope) and **which submitted wallet receipts fall within agreed terms**. COVERDICT is a narrowly scoped, programmable claims *adjudication* experiment. It combines deterministic transfer-receipt tests with an AI-verifiable issuer incident report and an immutable policy. An independently reproduced GenLayer consensus result changes a wallet's eligibility to claim a **demo-credit** award.

COVERDICT is **not** a production insurance, loss oracle or decentralized guarantee. It **does not** independently prove economic loss. It is distinct from milestone acceptance projects because the consequence concerns an incident program and wallet-specific transaction eligibility; this distinction must be demonstrated with real GenLayer evidence before a Projects submission.

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
- User-supplied Studio screenshot displays **Normal (Full Consensus)**, `Contract deployed`, and `FINALIZED`. Deployment source parity and a confirmed successful `get_program_count()` read are **still pending**. **No claim adjudication has been proven live.**
- This deployment corresponds to the `fix/testnet-readiness` variant with the `close_unverifiable_claim` method visible in Studio. The exact deployed source still needs independent comparison with the branch.
- Use only Sepolia test-ETH as synthetic receipt data; no financial compensation is available.

## Web app / deployment

Frontend is a responsive React + Vite English-first app with on-chain program discovery, wallet-specific claims, issuer controls, demo-credit claim and explorer-linked transaction history. It **does not** fabricate markets while no contract is deployed. After successful deployment, create `web/.env` with `VITE_COVERDICT_CONTRACT_ADDRESS=0x...`. The bundled frontend client currently targets **Studionet 61999**; change its network definition and validate chain IDs before moving to Bradbury. Vercel settings: root `web`, framework Vite, output `dist`.

Recommended development route: **local GenVM lint & tests → Studionet independent consensus → Bradbury public testnet → steward-reviewed Projects submission → security, oracle, legal and real partner validation → eventual Mainnet deployment when available and justified.** Only the deployment receipt is evidenced so far; do not claim the web app, oracle read, verdict consensus, or demo-credit payout succeeds until independent transaction receipts are recorded.

## Repository

- `contracts/Coverdict.py` — GenLayer Intelligent Contract, independent AI evaluation and demo-credit authorization.
- `tests/test_coverdict.py` — adversarial logic tests (local shim only).
- `web/` — TypeScript + React wallet UI; deployment gated by environment.
- `evidence/` — **synthetic reference templates**, not real incident proof.
- `REVIEWER.md` — on-chain reproduction and submission checklist.
- `SECURITY.md` — trust limitations and mainnet release blockers.
- `.github/workflows/ci.yml` — Python contract checks and web build.

## Relevant GenLayer references

- [Equivalence Principle](https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle)
- [Network Configuration](https://docs.genlayer.com/developers/intelligent-contracts/deploying/network-configuration)
- [Deploying Intelligent Contracts](https://docs.genlayer.com/developers/intelligent-contracts/deploying)
