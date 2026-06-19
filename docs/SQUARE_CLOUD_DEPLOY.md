# Legacy Square Cloud Guide

This deployment path is retired and is not the current TON618 production
architecture.

`ton618-web` runs under PM2 on the VPS, listens on port `3000`, and is published
through Cloudflare Tunnel. The active commercial provider is Tebex.

Before deployment, run:

```bash
npm test
npm run lint
npm run typecheck
npm run build
git diff --check
```

The authoritative cross-project architecture and deployment runbook is
`README_DEPLOY.md` in the `ton618-bot` repository. Do not use this legacy
filename to configure Square Cloud, billing providers or production secrets.
