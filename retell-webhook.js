// retell-webhook.js
// Simple Express webhook to receive data from Retell and insert into Supabase
// Usage: set env variables and run `node -r dotenv/config retell-webhook.js`

import express from 'express'
import bodyParser from 'body-parser'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const app = express()
// capture raw body for HMAC verification
app.use(bodyParser.json({ verify: (req, res, buf) => { req.rawBody = buf; } }))

const PORT = process.env.PORT || 8787
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SECRET_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY in environment')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Optional simple shared-secret validation (configure in Retell to send X-Hub-Signature or header)
const RETELL_SECRET = process.env.RETELL_SECRET || 'changeme'

app.post('/retell-webhook', async (req, res) => {
  // Basic validation: check header or HMAC signature if provided
  const incomingSecret = req.headers['x-retell-secret'] || req.query.secret
  const incomingSig = req.headers['x-retell-signature'] || req.headers['x-hub-signature'] || null

  if (RETELL_SECRET && RETELL_SECRET !== 'changeme') {
    // If signature header present, validate HMAC SHA256 against raw body
    if (incomingSig && req.rawBody) {
      try {
        const expected = crypto.createHmac('sha256', RETELL_SECRET).update(req.rawBody).digest('hex')
        // Accept formats like 'sha256=...' or raw hex
        const sig = incomingSig.startsWith('sha256=') ? incomingSig.split('=')[1] : incomingSig
        if (!crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(sig, 'hex'))) {
          console.warn('Invalid HMAC signature for webhook')
          return res.status(401).send({ ok: false, error: 'invalid signature' })
        }
      } catch (err) {
        console.warn('HMAC verification error', err)
        return res.status(401).send({ ok: false, error: 'signature verification failed' })
      }
    } else if (incomingSecret !== RETELL_SECRET) {
      console.warn('Invalid webhook secret')
      return res.status(401).send({ ok: false, error: 'invalid secret' })
    }
  }

  const payload = req.body || {}
  console.log('Received Retell webhook:', JSON.stringify(payload).slice(0, 2000))

  // Expected shape depends on how you configure Retell. Example fields below.
  const record = {
    session_id: payload.session_id || payload.call_id || null,
    phone: payload.phone || payload.caller || null,
    name: payload.customer_name || payload.name || null,
    email: payload.email || null,
    message: payload.transcript || payload.summary || JSON.stringify(payload),
    meta: payload,
    created_at: new Date().toISOString()
  }

  try {
    const { data, error } = await supabase.from('retell_calls').insert(record)
    if (error) {
      console.error('Supabase insert error', error)
      return res.status(500).send({ ok: false, error })
    }
    return res.send({ ok: true, data })
  } catch (err) {
    console.error('Unexpected error', err)
    return res.status(500).send({ ok: false, error: String(err) })
  }
})

app.get('/', (req, res) => res.send('Retell webhook running'))

app.listen(PORT, () => console.log(`Retell webhook listening on http://localhost:${PORT}`))
