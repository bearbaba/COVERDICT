# COVERDICT V2.1 — proposed source, not deployed

**State:** development candidate only. The existing deployed COVERDICT V2 at `0x844BE9205a755900B7a6E40596DeDbdC69825e63` is unchanged. Program #005 / Case #002 are **not** automatically repaired or migrated by this patch.

## Why V2 returned UNVERIFIABLE for Program #005

At 14:46:49 ICT on 2026-10-24, the user-provided GenLayer receipt for `resolve_claim(2)` was FINALIZED / GenVM SUCCESS / Consensus Accepted, **but returned SUBMITTED** with an AI `UNVERIFIABLE` verdict and nonempty evidence digest. The model claimed that wallet/recipient, on-chain attestation, and transaction-reuse proofs were missing. In the V2 code, the Sepolia receipt checks are deterministic and the submission/attestation gates are enforced by other methods, but the model prompt only says "RECEIPT VERIFIED" and does not supply the earlier contract state proof. Thus the model was asked to independently establish facts it could not observe and refused a synthetic award. The outcome is not an eligible approval.

## V2.1 candidate change

- Before invoking GenLayer nondeterminism, `resolve_claim` checks committed report/attestor/incident-window and used-receipt/single-wallet state directly from contract storage, and fails closed on inconsistency.
- Each validator still independently downloads immutable GitHub policy/report and the authentic Sepolia Blockscout JSON; verifies frozen SHA256, receipt hash, sender, recipient, positive value, chain status and block timestamp.
- Only then is the LLM asked whether the pinned **synthetic incident scope** actually matches the program's declared terms. The prompt is explicit about already-verified objective facts and does not demand proof of real-world loss. The model can still return INELIGIBLE or UNVERIFIABLE when pinned documents fail their own conditions.
- The validator's verdict must match the independently recomputed outcome and structured digest; source failures remain fail-closed.
- Demo credits remain non-redeemable, non-transferable and valueless. No mainnet assertion.

**Not yet completed:** independent live Studionet deployment, production address, UI deployment, live 2-wallet acceptance, full adversarial GenVM tests, audit, or migration. Do not use the V2.1 source as an address substitute for Program #005. A fresh deployment would require a new, explicitly signed workflow. Re-running V2 `resolve_claim(2)` without changing the deployed code might repeat UNVERIFIABLE; it is not a guaranteed fix.
