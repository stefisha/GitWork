# Arcium Integration in GitWork

GitWork integrates Arcium's Multi-Party Computation (MPC) network to encrypt bounty amounts, solving the privacy problem in public blockchain payments. When a repository owner creates a bounty using the `gitwork:currency:encrypted:amount` label, Arcium's Client and Reader SDKs (v0.3.0) encrypt the amount before storage, keeping it hidden from public view until claimed. Only authorized parties (repo owner and assigned contributor) can decrypt and view the actual bounty value through our authorization-based system.

This privacy layer enables enterprise adoption, prevents spam on high-value bounties, and protects contributor earnings from public tracking. The implementation includes five REST API endpoints, an EncryptedBountyBadge UI component, and automatic fallback mechanisms for reliability. For complete technical details, see `ARCIUM_INTEGRATION.md`.

