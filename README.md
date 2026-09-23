# Social Publisher V7

Cloudflare Worker project for Social Publisher.

## Deploy with Cloudflare Workers Builds

1. Create a GitHub repository and upload this folder's contents.
2. Cloudflare Dashboard → Workers & Pages → Create application → Import a repository.
3. Select the GitHub repository.
4. The Worker name must remain `social-publisher` to keep the existing workers.dev URL.
5. Build command: leave empty.
6. Deploy command: `npx wrangler deploy`.
7. Save and Deploy.

## Secret

In the Worker: Settings → Variables and Secrets → add a production Secret:

`META_APP_SECRET`

Use the existing Meta App Secret. Do not put it in GitHub.

## Meta OAuth callback

If the Worker keeps the URL `https://social-publisher.srkthsbi.workers.dev`, the existing callback remains:

`https://social-publisher.srkthsbi.workers.dev/callback`

If Cloudflare forces a different Worker name, add the new `/callback` URL to the Meta app's Valid OAuth Redirect URIs before logging in.

## Storage

No R2, KV, D1, database, or persistent media archive is configured.
