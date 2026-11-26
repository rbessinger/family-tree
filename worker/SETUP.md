# Family Ask bot: setup (about 10 minutes, once)

You do these steps yourself so the key never passes through anyone else.

1. Anthropic key
   - Sign in at https://console.anthropic.com
   - Billing: add $10 of credit. Set a monthly spend limit of $10.
   - API keys: create a key named "family-tree". Copy it once.

2. Cloudflare Worker
   - Free account at https://dash.cloudflare.com
   - Workers & Pages > Create > Worker. Name it `family-ask`. Deploy, then Edit code.
   - Replace the code with everything in worker/worker.js. Deploy.
   - Settings > Variables and Secrets > Add secret named ANTHROPIC_API_KEY. Paste the key there.
   - Optional but recommended: Storage & Databases > KV > create a namespace "family-spend", then Worker Settings > Bindings > Add KV binding named SPEND. This keeps the monthly cap across restarts.
   - Optional: add a plain variable MONTHLY_TOKEN_CAP (default 3000000 tokens per month).

3. Tell Claude the Worker address (https://family-ask.<name>.workers.dev).
   Claude sets it in config.js, pushes, and tests a real question.

Safety built in: only the family site can call it, 25 questions per visitor per hour,
a monthly token cap, and living relatives' private details are blocked in code.
