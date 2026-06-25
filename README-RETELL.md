Retell -> Supabase integration (quick guide)

Goal
- Let Retell make an outbound call or accept an inbound call, collect information from the caller, and send structured call data to Supabase.

Overview
1. Retell agent runs the call. When the conversation completes (or at desired points), configure the agent to call an HTTP webhook or use "function calling" to POST the collected data to your server.
2. Your server (example: `retell-webhook.js`) receives the payload and inserts a row into Supabase using the service key.
3. Use ngrok (or a deployed HTTPS server) while testing so Retell can reach your local webhook.

Files added
- `retell-webhook.js` — Express webhook that inserts into `retell_calls` table in Supabase.

How to run (local test)
1. Copy `.env.example` to `.env` and fill `SUPABASE_SECRET_KEY` and `SUPABASE_URL` and set `RETELL_SECRET`.
2. Install deps:

```bash
npm install express body-parser @supabase/supabase-js dotenv
```

3. Run server:

```bash
node -r dotenv/config retell-webhook.js
```

4. Expose to the internet (ngrok):

```bash
npx ngrok http 8787
```

Copy the HTTPS URL from ngrok (e.g. `https://abcd.ngrok.io`) and configure it in Retell Dashboard as a webhook endpoint for the agent to call.

Database setup
- Run the SQL in `db-retell-calls.sql` in the Supabase SQL editor to create the `retell_calls` table.

HMAC / webhook security
- The `retell-webhook.js` accepts either a simple shared secret header `x-retell-secret` or an HMAC `x-retell-signature` (sha256) if you configure Retell to sign payloads. Set `RETELL_SECRET` in your `.env` and Retell should send signature/header accordingly.

Local simulation and testing
- A small test page `call-test.html` is included — open it while your webhook server is running to POST a test payload locally.
- `simulate-retell.js` will POST a sample payload to your webhook. Use it like:

```bash
node -r dotenv/config simulate-retell.js
```


Configuring Retell
- In your Retell agent flow, add a webhook or function call action at the moment you want to send data (end of call or after collecting details).
- Point the request to `https://your-ngrok-url/retell-webhook` and include your `RETELL_SECRET` as a header `x-retell-secret` (or use whatever verification method Retell provides).
- Test a call from Retell. Monitor `retell-webhook` console and your Supabase table `retell_calls`.

Debug checklist if Retell doesn't make the call
- Confirm agent is published and deployed in Retell dashboard.
- Confirm the widget can start calls (check console for errors). The widget showing is not enough; the agent must be configured to make outbound calls.
- Ensure telephony (phone numbers, SIP, credits) is set up in Retell for outbound calls.
- Check Retell logs (agent sessions) in dashboard for errors.
- Use a production HTTPS endpoint (ngrok is fine for testing).
- Verify webhook secret header matches.

Next steps I can do for you
- Create the `retell_calls` table SQL for Supabase and apply it here.
- Wire a small UI page in the project that triggers a test call and shows returned results.
- Add signature verification for the webhook if Retell provides HMAC signing.

Tell me which next step you'd like me to take.
