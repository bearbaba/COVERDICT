# COVERDICT V2 — Reviewer Video & Acceptance Guide

**Public reviewer web (deployed 23 October 2026):** [https://coverdict-testnet.vercel.app](https://coverdict-testnet.vercel.app). Production commit `8bf9ccca8e3a95c1d1e680373dd15ce1b001ed3c` is shown READY by Vercel and mapped to the canonical domain, after [PR #14](https://github.com/bearbaba/COVERDICT/pull/14) merged with [green CI](https://github.com/bearbaba/COVERDICT/actions/runs/39966701633). Frontend build is configured with public `VITE_COVERDICT_V2_CONTRACT_ADDRESS` for the deployed V2 contract. The reviewer must still confirm browser loads live Program #2 and Case #1 and wallet B shows 100 demo credits; no independent browser E2E pass is claimed.

**Environment:** GenLayer Studionet (chain 61999), deployed V2 contract `0x844BE9205a755900B7a6E40596DeDbdC69825e63`.
**Scope:** one completed synthetic positive claim and a rejected second award. This is **NOT insurance, real DeFi loss verification, token compensation, escrow or Mainnet deployment**.

## Evidence already accepted on GenLayer

| Step | Observable evidence |
| --- | --- |
| Locked program | [V2 Program #2 creation](https://explorer-studio.genlayer.com/tx/0x0f8ff8869ee0f392887ee4734ebaacfb8a6a99a3a49e7278099359d3c2e0af41) — `FINALIZED`, GenVM `SUCCESS`, return `2` |
| Precommitted policy | [Immutable policy file](https://github.com/bearbaba/COVERDICT/blob/8165ba339606315fb2d53111524ad7e0d0478435/evidence/v2_program_02_policy.txt) — SHA256 `e45afdb4965286995263a86d9a2456745438f5747234f56a155b41e2c9eccf3a` |
| Real testnet receipt | [Ethereum Sepolia transaction](https://sepolia.etherscan.io/tx/0x7e24af7f845356332d300471cdbb70584ddea7568538e638aa438daec93ead9f) — claimant B `0xd6b8...a8c2af` to issuer recipient A `0x4c7c...508dcb` |
| Post-window report | [Immutable synthetic incident report](https://github.com/bearbaba/COVERDICT/blob/8b3df9673258fefc40b0a04ed387ce54091cb041/evidence/v2_program_02_report.txt) — SHA256 `fc6b84e341cdd365658fef4c0abe42b4e0e42c605e6e24cbe51c055fce477170` |
| Attestation | User-provided `get_program(2)`: `report_attested=true`, `attested_at=1792673488`. Original successful `attest_report` tx hash still needs archiving if it can be retrieved. |
| AI decision | [`resolve_claim(1)` transaction](https://explorer-studio.genlayer.com/tx/0xa38a935a081667c9d88d5692a84cdfc426eda164df0e7788e2c567bcfb275ad7) — `FINALIZED`, `SUCCESS`, `APPROVED`, `ELIGIBLE`, empty stderr |
| Award | User-provided on-chain reads: `get_case(1)=CLAIMED`, `get_demo_balance(B)=100`, `get_program(2)` submitted/approved/claimed `1/1/1`. Credits have no financial value. |
| Replay rejection | [Repeated `claim_demo_award(1)` rejected](https://explorer-studio.genlayer.com/tx/0xae369845bd8562dceea37b7d8dda27fe0a882246db5c81a4318728a9ef586ce3), error `No unclaimed approved award`; subsequent reads unchanged, balance still 100. Screenshot showed consensus `ACCEPTED` and execution `ERROR`, not proof of a successful second award. |

## One-web walkthrough

Use the V2-enabled frontend **only after verifying** the deployment address, version and public on-chain data. The frontend's completed demonstration card is shown **only if live case #1 and program #2 match the observed award state**. Do not substitute a screenshot, hardcoded verdict, or old V1 data. Recording can use the existing on-chain historical proof; no new Sepolia transfer or claim is required.

Suggested uncut 2–3-minute sequence:

1. Show COVERDICT V2 homepage, Studionet environment, completed Program #002 card, and testnet-only scope.
2. Open Program #2; show incident window, issuer, attestor, pinned policy and report. The report attestation is recorded in the on-chain program.
3. Open Public Claims; select Case #001. Show `ELIGIBLE`, `CLAIMED`, digest, and original Sepolia receipt.
4. Open the linked GenLayer `resolve_claim(1)` transaction; show Full Consensus, `APPROVED`, five initial validators and one rotation. Do **not** imply the count is evidence of each validator's individual narrative vote.
5. With wallet B connected, show on-chain demo balance `100`. Optionally open the rejected double-claim transaction and the unchanged state after rollback.
6. Close by showing the repository and `SECURITY.md` trust boundary. No funds/insurance/DeFi loss are claimed.

## Final verification gate before publishing the video

- Public HTTPS loads without authentication; client resolves `get_contract_version() = 2.0.0-testnet-experimental`, program #2 and Case #1 from the V2 contract (not V1).
- GitHub build/test and Vercel deployment are successful; address in the footer is V2.
- Browser refresh does not erase public program/case on-chain data; no fabricated or injected case data is shown.
- Wallet B connects on chain 61999 and balance 100 is displayed. Review browser errors and mobile layout; do not state browser acceptance has passed until personally observed.
- Keep the original V1 deployment separate. The V2 reviewer UI deliberately hides untested close-unverifiable action; no production insurance or Mainnet features are shown.

Video claim: **“COVERDICT V2 demonstrates SHA256-pinned synthetic incident policies, independent wallet report attestation, GenLayer AI consensus, and one-time on-chain demo credit authorization.”**
