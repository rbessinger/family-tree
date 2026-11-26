# Family site and Ask bot: setup

Site address: https://family.bessinger.fyi  (GitHub Pages, repo rbessinger/family-tree)
Bot address:  https://ask.bessinger.fyi     (Cloudflare Worker "family-ask")

## A. Point family.bessinger.fyi at the site
1. Cloudflare dashboard > bessinger.fyi > DNS > Add record.
   Type CNAME, Name family, Target rbessinger.github.io, Proxy status DNS only (grey cloud). Save.
2. Tell Claude. Claude checks the name resolves, then adds the CNAME file to the repo.
   Do not set the custom domain before DNS exists: the old github.io link would break.
3. GitHub > repo family-tree > Settings > Pages. When "Enforce HTTPS" becomes tickable (15 to 60 minutes), tick it.

## B. Anthropic key
4. https://console.anthropic.com : sign in.
5. Settings > Billing: add a card, buy $10 of credit, leave auto-reload off.
6. Settings > Limits: set the monthly spend limit to $10.
7. API keys > Create key, name it family-tree. Copy it (shown once).

## C. Cloudflare Worker
8. Workers & Pages > Create > Hello World template > name family-ask > Deploy > Edit code.
   Delete everything, paste all of worker/worker.js (open it on GitHub, click Raw, select all, copy). Deploy.
9. Worker > Settings > Variables and Secrets > Add > Type Secret, name ANTHROPIC_API_KEY, paste the key. Deploy.
10. Storage & Databases > KV > Create namespace family-spend. Then Worker > Settings > Bindings > Add > KV namespace,
    variable name SPEND, choose family-spend. Deploy.
11. Worker > Settings > Domains & Routes > Add > Custom domain > ask.bessinger.fyi.
12. Tell Claude. Claude sets the address in config.js, pushes, and tests a real question.

Safety built in: only the family site can call the bot, 25 questions per visitor per hour,
a monthly token cap (variable MONTHLY_TOKEN_CAP, default 3000000), and living relatives' private details are blocked in code.
