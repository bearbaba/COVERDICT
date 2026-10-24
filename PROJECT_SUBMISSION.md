# COVERDICT — GenLayer Projects Submission & Reviewer Evidence

**Submission date:** 24 October 2026  
**Submission category:** GenLayer Projects  
**Project:** COVERDICT  
**Live application:** https://coverdict-testnet.vercel.app/?program=5  
**Demo video (English, ~3m21s):** https://youtu.be/cKqjh9GAJug  
**Source repository:** https://github.com/bearbaba/COVERDICT  
**Deployed V2 contract (GenLayer Studionet, chain ID 61999):** [0x844BE9205a755900B7a6E40596DeDbdC69825e63](https://explorer-studio.genlayer.com/address/0x844BE9205a755900B7a6E40596DeDbdC69825e63)

> **SECURITY REVIEW STATUS (24 OCT 2026):** zoefunds requested fixes to two admission vulnerabilities in the **deployed V2**. The submitted Program #005 demo remains historical evidence of a completed synthetic workflow, but **does not demonstrate these vulnerabilities are fixed**. A separate [V2.2 candidate](contracts/CoverdictV2_2.py), [regression tests](tests/test_coverdict_v22.py), and [security response](V2_2_ADMISSION_SECURITY_REVIEW.md) are available; V2.2 is **not deployed** and needs new Studionet adversarial acceptance.

> **Scope:** A verifiable **synthetic, testnet-only** incident-claim adjudication demonstration. COVERDICT is **not** insurance, escrow, a financial compensation protocol, an independent oracle proving real-world losses, or a mainnet-ready security product. A Sepolia test-ETH transfer is not evidence of economic loss. Demo credits are nontransferable, nonredeemable and have **zero monetary value**.

## 1. Project summary

**One-liner:** COVERDICT uses GenLayer AI consensus to adjudicate synthetic incident claims from pinned policies, attested reports and real Sepolia receipts, then gate one-time demo awards.

COVERDICT addresses a consequential workflow rather than using an AI model as a webpage classifier. An issuer precommits an immutable synthetic incident policy, a distinct attestor signs the exact post-window report digest, and a claimant submits a real Ethereum Sepolia test transaction. The GenLayer Intelligent Contract checks objective evidence, uses nondeterministic AI assessment under validator equivalence, and stores a verdict that controls the right to receive a **single wallet-bound demo-credit award**.

The contract distinguishes **ELIGIBLE** (approve), **INELIGIBLE** (deny) and **UNVERIFIABLE** (keep unresolved without issuing an award). An approved claimant must still explicitly invoke the one-time award method. There is no owner backdoor that simply declares arbitrary claims approved.

## 2. Why GenLayer is essential

Standard smart contracts can enforce address, timestamp, uniqueness and value constraints. The disputed issue in COVERDICT is whether a report's *natural-language synthetic incident narrative* actually falls within the issuer's previously frozen policy.

The deployed V2 Intelligent Contract, [`contracts/CoverdictV2.py`](contracts/CoverdictV2.py):

1. Reads **two SHA-256-pinned documents** at immutable GitHub commit URLs: the policy and the incident report.
2. Retrieves a transaction from a **fixed Ethereum Sepolia Blockscout API endpoint**, rather than allowing arbitrary claimant-supplied URLs.
3. Checks the exact receipt hash, sender, designated recipient, successful status, positive native test-ETH amount, and locked block-time interval.
4. Invokes GenLayer's **`gl.vm.run_nondet_unsafe`** with an evaluator and a validator that independently reassesses evidence. The validator checks the proposed verdict and normalized evidence digest.
5. Persists the resulting claim state; only an **APPROVED / ELIGIBLE** claim can mint one-time, valueless demonstration credits for the original claimant wallet.

The separate attestor signature is an **on-chain role confirmation of the report digest**; it does not independently establish truth of the incident. Source pinning establishes document integrity, not issuer credibility. A single Blockscout API is not a cryptographic light-client proof.

## 3. Completed end-to-end demo — Program #005 / Claim #002

The public demo was recorded with actual wallet confirmations and GenLayer transactions on **24 October 2026**.

| Phase | Who signs / network | Observable evidence |
| --- | --- | --- |
| Create Program **#005** | **Wallet A**, GenLayer Studionet | Incident class `SIMULATED_DEPOSIT_MISROUTE_DRILL`, fixed recipient, 13:30–13:40 ICT window, 18:00 ICT claim deadline, 100 credits, capacity 1 |
| Precommit policy | Issuer-supplied immutable Git commit | [Exact pinned policy](https://github.com/bearbaba/COVERDICT/blob/9b3c198be031fd062484b5258c264fd1c7b547a7/evidence/v2_live_video_20261024_1330_policy.txt) and on-chain SHA-256 |
| Submit real testnet receipt | **Wallet B → Wallet A**, Ethereum Sepolia | [Sepolia transaction `0xd2a4…ad7b`](https://eth-sepolia.blockscout.com/tx/0xd2a4cdcc7f242af32a78adf4d1868ed7eba3e27723a86d79aa9d2ff6ff6dad7b); direct native test-ETH transaction, not a simulated hash |
| Attach incident report | **Wallet A**, GenLayer Studionet, after window | [Exact pinned synthetic report](https://github.com/bearbaba/COVERDICT/blob/bab2987d6f505fb8302cf7db0ec7ca409bd5d41a/evidence/v2_live_video_20261024_program_05_report.txt) |
| Attest report hash | **Wallet C**, GenLayer Studionet | [Finalized attestation transaction](https://explorer-studio.genlayer.com/tx/0x33e87623196dd04affd003d9a3ac5cbd2cfdad8347a9d1191badec5ce7d61727) |
| Submit Claim **#002** | **Wallet B**, GenLayer Studionet | Claim references Program #005 and the exact Sepolia transaction above |
| Initial AI review | **Wallet B**, GenLayer Studionet | [Finalized `resolve_claim(2)` transaction](https://explorer-studio.genlayer.com/tx/0x56e3e3d38a5f7711b7c2c202f7049c79d4ebf23ea814e647f9d0b3e7259b3bd8): GenVM SUCCESS, **UNVERIFIABLE**, return `SUBMITTED`; **no award issued** |
| Subsequent AI review | **Wallet B**, GenLayer Studionet | Demo recording shows claim move to **APPROVED / ELIGIBLE** after a further review. The full final positive transaction hash is not yet separately catalogued in this document; inspect the chain and the video rather than relying on an invented link. |
| Claim demo award | **Wallet B**, GenLayer Studionet | Demo recording shows Claim #002 at **CLAIMED**, **+100** valueless credits, and wallet B's **200** total demo-credit balance (including the earlier Program #002 award). No assets or money are transferred. |

**Important:** The first `UNVERIFIABLE` review was a **genuine result**, not a UI or network failure; the contract appropriately withheld the award at that point. The later successful review is shown in the full video. We do not claim that the first AI attempt automatically approved the claim, or that any individual validator votes were independently audited.

### Frozen source fingerprints

- **Policy:** commit `9b3c198be031fd062484b5258c264fd1c7b547a7`; SHA-256 `091da618e427aebd97bd686a43c38618d5b7b1c026730cc04366e0cbc1795f0f`.
- **Report:** commit `bab2987d6f505fb8302cf7db0ec7ca409bd5d41a`; SHA-256 `7e487392f70f6221d4df71e10e031a9df212d9300ff8db330de1c4d6c2ed6bf2`.
- **Claim receipt:** `0xd2a4cdcc7f242af32a78adf4d1868ed7eba3e27723a86d79aa9d2ff6ff6dad7b`.
- **Initial unresolved verdict digest:** `57b646164fe913e76d54bc96c4ae9edf9f4d07df205f8cbe6dd9b3fec5168a96`.

## 4. Exact reviewer path — read-only, no signatures required

**Start here:** https://coverdict-testnet.vercel.app/?program=5

1. Open the HTTPS dApp. Verify the **Studionet** environment and V2 contract address. The project is a synthetic testnet demonstration.
2. Open or inspect **Program ID 5**; read its locked incident window, designated Sepolia recipient, policy URL, post-window report and attestor information. The policy and report are tied to immutable Git commit SHAs.
3. Open **Public Claims → All claims** and locate **Claim #002** associated with Program #005 (not the older Program #002 demonstration).
4. Expand the claim evidence, open the linked [Sepolia transaction](https://eth-sepolia.blockscout.com/tx/0xd2a4cdcc7f242af32a78adf4d1868ed7eba3e27723a86d79aa9d2ff6ff6dad7b), and inspect the publicly queryable claim and program data.
5. The completed workflow's recorded result is **ELIGIBLE → CLAIMED** with **100** demo credits for this claim, and a demonstrated wallet B total of **200**. See the [3m21s video](https://youtu.be/cKqjh9GAJug) for wallet signatures and intermediate consensus states. Read-only inspection requires **no transaction or wallet authorization**.
6. Review the deployed V2 ABI/source and regression tests: [contract V2](contracts/CoverdictV2.py), [V2 tests](tests/test_coverdict_v2.py), [frontend](web/src/main.tsx), [security disclosure](SECURITY.md).

**Expected outcome:** The reviewer can independently inspect a pinned synthetic policy, a separately signed synthetic report, an authentic Sepolia receipt, a consensus-controlled approval transition, and a one-time demo-credit claim. A reviewer need not perform a new transaction or recreate the incident window.

If a public data fetch is temporarily unavailable, use the linked GenLayer Explorer and immutable GitHub files, and report the unavailable part rather than interpreting a UI screenshot as independent chain proof.

## 5. Distinct roles and contract protections

- **Wallet A — issuer and designated receipt recipient:** `0x4C7cb73aC8F8999af21cfc9fF4cF2333a9508Dcb`.
- **Wallet B — separate claimant:** `0xD6b8A3A5eB329410D9504784812b8569afA8C2aF`.
- **Wallet C — designated report attestor:** `0x60Bfdf6315294c7856Acdc0B80D7Bd40217DEBff`.

The contract restricts report attachment to the issuer, report attestation to the declared separate attestor, excludes issuer/attestor from claims, binds the claim to the original wallet, and enforces claim/receipt uniqueness and one-time award redemption. Failed or incomplete evidence is not silently treated as `ELIGIBLE`.

There is **no actual escrow** and no payment or insurance promise. The consensus verdict has a real **testnet state consequence**: which wallet is authorized to increment its one-time demo-credit balance.

## 6. Verification, implementation and limitations

**Implemented:** GenLayer Python Intelligent Contract, React/Vite application with MetaMask wallet interactions, read-only public explorer links, wallet-scoped workspace, immutable policy/report evidence, separate on-chain attestation, Sepolia receipt assessment, consensus resolution and one-time credit redemption.

**Tests:** `python -m pytest -q tests/` and `cd web && npm run build`. Tests include simulated mocked GenLayer calls; passing tests do **not** replace live end-to-end verification or a security audit.

**Known boundaries:** This is experimental Studionet software and not suitable for mainnet finance. It uses an issuer-authored incident report and a single Blockscout REST data source; model/verifier output can be uncertain. Review the [security limitations](SECURITY.md). The live V2 is the **existing address above**.

**Separate candidate, NOT deployed:** [`contracts/CoverdictV2_1.py`](contracts/CoverdictV2_1.py) is an independently proposed **V2.1 source candidate**, not the smart contract behind Program #005 and not a new address to review for this submission. [Candidate notes](V2_1_CANDIDATE.md) disclose improvements under development. Do **not** treat that candidate or passing CI as an automatically deployed repair to V2.

## 7. Concise steward verification statement

> COVERDICT is a GenLayer-native application with a concrete, auditable consequence: an AI consensus verdict determines whether a separate claimant wallet may receive a one-time, nonredeemable synthetic demo-credit award. The full video documents wallet A's immutable policy/report, wallet C's hash attestation, wallet B's real Sepolia evidence and claim, a non-awarding UNVERIFIABLE assessment, and a subsequent ELIGIBLE decision followed by CLAIMED. These are testnet adjudication records, not proof of real-world loss or an insurance payout.

**Primary evidence URL to add to GenLayer Projects:** https://github.com/bearbaba/COVERDICT  
**Supplemental single-document reviewer guide:** https://github.com/bearbaba/COVERDICT/blob/main/PROJECT_SUBMISSION.md  
**Video:** https://youtu.be/cKqjh9GAJug
