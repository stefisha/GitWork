# Security

GitWork is retired and preserved for source review. Its historical backend has not undergone a complete security audit.

## Credentials

Use your own replacement credentials. Do not reuse keys from historical deployments. Removing credentials from Git does not revoke them: rotate affected GitHub webhook and OAuth secrets, Privy secrets, and RPC API credentials through their providers. Stop using any wallet whose private key was exposed.

Server credentials belong in the root `.env` or a secret manager. The `.env.example` files contain safe defaults and variable names only. Browser `VITE_*` settings are visible to every visitor and must never contain server secrets.

Keep private keys, database files, internal deployment instructions, wallet recovery scripts, logs, and audit reports out of commits. Application logging must not print webhook secrets or wallet private keys.

## Scope of cleanup

The public snapshot preserves the original interface, application routes, wallet flows, and payment logic. Cleanup removes tracked credentials, account-specific operational scripts, and sensitive logging, and moves retired browser integration identifiers into environment configuration. It is not a broader security hardening or redesign of the application.

Before running a live service, separately review authentication, webhook verification, request validation, session storage, simulation endpoints, CSRF protection, withdrawal concurrency, payout retries, token mint/cluster compatibility, and refund behavior. Use devnet and fresh test credentials for integration review.

## Secret scanning

With Gitleaks installed:

```sh
gitleaks git . --log-opts="--all" --redact
```

Scan all branches and tags as well as the current source. A normal deletion commit does not remove values from older commits. History rewriting also cannot invalidate credentials or remove third-party clones, forks, or GitHub cached references.

See [GitHub's sensitive-data removal guidance](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).

Do not post credentials or personal information in public issues.
