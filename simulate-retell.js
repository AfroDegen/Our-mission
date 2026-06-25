// simulate-retell.js
// Simple script to POST a sample Retell payload to the local webhook for testing
// Usage: node -r dotenv/config simulate-retell.js

const url = process.env.RETELL_WEBHOOK_URL || 'http://localhost:8787/retell-webhook'

const sample = {
  session_id: 'sim-12345',
  phone: '+15551234567',
  customer_name: 'Test Caller',
  email: 'test@example.com',
  transcript: 'Hello, I want a quote for a kitchen renovation',
  summary: 'Lead interested in kitchen renovation',
}

async function run(){
  try{
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-retell-secret': process.env.RETELL_SECRET || 'changeme'
      },
      body: JSON.stringify(sample)
    })
    const json = await res.json()
    console.log('Response:', json)
  }catch(e){
    console.error(e)
  }
}

run()
