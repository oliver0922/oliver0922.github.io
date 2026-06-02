# Owner-only visit logger

This Cloudflare Worker stores raw visitor IP addresses in D1 and exposes them
only through a bearer-token protected `/admin` endpoint.

## Deploy

1. Install dependencies and sign in:

   ```sh
   npm install
   npx wrangler login
   ```

2. Create the D1 database:

   ```sh
   npx wrangler d1 create injaelee-visit-log
   ```

3. Copy the returned database ID into `wrangler.jsonc`.

4. Create the schema:

   ```sh
   npm run db:init
   ```

5. Generate a strong owner token and store it as a Worker secret:

   ```sh
   openssl rand -hex 32
   npx wrangler secret put ADMIN_TOKEN
   ```

6. Deploy:

   ```sh
   npm run deploy
   ```

7. The deployed Worker URL is configured in `../visit-tracker.js`. Add this
   before `</body>` on each tracked page:

   ```html
   <script defer src="/visit-tracker.js"></script>
   ```

## View visits

Use the secret token locally. Never place it in the website source.

```sh
curl \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://injaelee-visit-log.injaelee.workers.dev/admin?limit=100"
```

Raw visit rows are deleted after 90 days by the configured daily cron trigger.

## Privacy

Raw IP addresses are personal data in many jurisdictions. The tracker sends a
request when a tracked page loads. Check the requirements that apply to the
website before enabling or changing the tracker.
