# GitHub Push Checklist

Use this checklist before every push.

## Must pass before push
- No secrets in tracked files (`.env`, API keys, tokens, private keys).
- No local caches/artifacts (`node_modules`, `dist`, `.venv`, `.pytest_cache`, logs).
- No machine-local AI tooling folders (`.agent`, `.claude`, `.codex`, etc.).
- `git diff --cached` only contains intended changes.
- Build/lint/tests for touched scope pass.

## Quick commands
```bash
git status --short
git diff --cached
git ls-files | rg "(\.env$|\.pem$|\.key$|id_rsa|credentials\.json)"
rg -n --hidden -g "!.git/**" -g "!node_modules/**" "sk_[A-Za-z0-9_-]+|hf_[A-Za-z0-9]+|BEGIN (RSA|EC|OPENSSH) PRIVATE KEY"
```

## Team policy
- Keep only product code/docs in this repo.
- Put local agent/skill packs in user-home, not inside project git history.
- Use `.env.local` for local secrets and commit only `.env.example`.
- If a secret is ever committed: rotate it immediately and rewrite history.
