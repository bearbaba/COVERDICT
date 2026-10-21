# COVERDICT security policy · preproduction

**Experimental, not audited, not insurance and not safe for real-money financial operations.** Only nontransferable, nonredeemable demo credits can be minted as claim awards. There is no custody, premium, payout token, redemption, payable method, or authorized liability commitment. Never send ETH, GEN, USDC or any financial asset to this contract.

## Explicit trust assumptions and limitations

1. **Ownership proof is narrow:** the GenLayer caller owns the wallet string used in the claim; receipt proves a direct, positive-value, successful Ethereum mainnet native ETH transfer from the *same* address to the locked deposit contract in the locked window. This is not proof of exploit causality, monetary loss, covered insurance exposure, or compliance with real-world contracts.
2. **Report provenance is centralized:** only the demo program issuer can attach a pinned report. Git commit pinning and SHA256 authenticate bytes, NOT the author's identity, authority or truthfulness. An arbitrary wallet may create a false demonstration program. The UI must disclose the issuer and never use the word `insured` or imply financial guarantees.
3. **Single explorer:** `eth.blockscout.com` is used for non-consensus-authenticated REST responses. Validator agreement is not an Ethereum consensus proof. Production requires finalized on-chain proofs or a justified quorum of independent sources and anti-reorg handling.
4. **External reliability:** rate limits, web decoding errors, GitHub/Blockscout unavailability, redirects, mutable data, API changes or model errors may leave claims `UNVERIFIABLE`. Unknown is never silently counted as DENIED.
5. **LLM safety:** source bytes are enclosed as untrusted data; validators independently refetch/reason, but can still agree on a false verdict. Model output should be bounded by objective criteria and subject to a real appeal mechanism. This version has NO challenge period or economic stakes.
6. **Policy scope:** one wallet/one transaction per demonstration program, 20 claims maximum, fixed award credits. A malicious third party can still create sybil wallets, invent issuer programs, or use transfer receipts that prove no loss. There is no real claims liability, insurance reserve, actuarial assessment, or wallet-to-person identity verification.
7. **Timeout and finality:** a claim may remain `SUBMITTED` indefinitely if sources fail. No administrator can flip the verdict, but `APPROVED` has no appeal delay before virtual credit claim. For real funds require bounded exit/refund options, dispute bonds, reviewer separation, oracle proof and deterministic appeal/finality.
8. **Mismatch risk:** fake or synthetic evidence must not be marketed as real exploit data. The demo artifacts in `evidence/` are deliberately fictional.
9. **Contract still needs GenVM validation:** local Python tests and frontend CI are not live GenLayer deployment evidence. Run `genvm-lint`, test every method on Studionet, capture validator traces and verify actual execution success, not merely ACCEPTED consensus status.

## Mainnet approval gate

Mainnet with asset custody should remain blocked until: independent security audit; demonstrated Ethereum receipt authentication or proof verification; identity/anti-sybil and replay resistance; binding coverage underwriting and funding partner; objective loss accounting with no double compensation; multi-source incident attestation; adversarial LLM tests; legal and regulatory review; bounded appeal/grace windows; and a documented economics/solvency model.

Do not report vulnerabilities with exploitable transaction details in public issues. Use GitHub private security reporting if available. Never commit signing keys or API tokens.
