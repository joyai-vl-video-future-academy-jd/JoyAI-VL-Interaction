# JoyAI-VL-Interaction

## We are open-sourcing all of it, the 8B model, its training recipe, the data, and the deployable system, so anyone can stand up a real-time, always-present assistant andcarry the interaction-model direction forward in the open. We expect the full release to be complete by <strong>June 20, 2026</strong>, at <a href="https://github.com/jd-opensource/JoyAI-VL-Interaction">https://github.com/jd-opensource/JoyAI-VL-Interaction</a>.





## Page-view counter

The blog footer already contains a lightweight page-view display:

```html
<span class="page-views" id="pageViews" data-endpoint="">Page views <strong>--</strong></span>
```

To make it live, deploy the Cloudflare Worker in `workers/page-views.js` and point
`data-endpoint` to the deployed `/pageview` URL.

### Cloudflare setup

1. Install Wrangler:

```bash
npm install -g wrangler
```

2. Authenticate with Cloudflare. Either run:

```bash
wrangler login
```

or set a scoped API token:

```bash
export CLOUDFLARE_API_TOKEN="YOUR_TOKEN"
export CLOUDFLARE_ACCOUNT_ID="YOUR_ACCOUNT_ID"
```

The token should be scoped to the target Cloudflare account with:

- `Workers Scripts Edit`
- `D1 Edit`
- `Account Settings Read`

Do not commit the token.

3. Create the D1 database:

```bash
wrangler d1 create joyai-vl-interaction-pageviews
```

4. Copy `wrangler.example.toml` to `wrangler.toml`, then replace
`REPLACE_WITH_D1_DATABASE_ID` with the `database_id` printed by Wrangler.

```bash
cp wrangler.example.toml wrangler.toml
```

5. Initialize the remote D1 table:

```bash
wrangler d1 execute joyai-vl-interaction-pageviews --remote --file=./workers/schema.sql
```

6. Deploy the Worker:

```bash
wrangler deploy
```

7. Update the footer endpoint in `index.html`:

```html
data-endpoint="https://YOUR_WORKER_SUBDOMAIN.workers.dev/pageview"
```

8. Test the endpoint:

```bash
curl -X POST "https://YOUR_WORKER_SUBDOMAIN.workers.dev/pageview?page=https://joyai-vl-video-future-academy-jd.github.io/JoyAI-VL-Interaction/"
```

It should return JSON like:

```json
{"page":"joyai-vl-video-future-academy-jd.github.io/JoyAI-VL-Interaction/","views":1}
```
