# ⚡ Lead IQ — AI-Powered Coffee Shop Sales Pipeline

A Next.js app that tracks sales leads for coffee shop equipment and services, scoring each lead 1–10 using Groq AI so your team knows exactly who to call first.

**GitHub:** https://github.com/Yasminenaser1/-lead-iq

---

## What it does

- Add leads (company, contact, size, notes)
- Click **⚡ Analyze** — Groq AI scores the lead 1–10 with a reason
- Track status: New → Contacted → Qualified → Closed
- Dashboard shows total leads, qualified count, and average AI score
- All data persists locally in `leads.json`

---

## Tech stack

| Layer    | Tech                        |
|----------|-----------------------------|
| Frontend | Next.js 14 (App Router)     |
| Backend  | Next.js API routes          |
| Storage  | JSON file (`leads.json`)    |
| AI       | Groq API (llama-3.3-70b)    |

---

## Quick start

```bash
git clone https://github.com/Yasminenaser1/-lead-iq
cd -lead-iq
npm install
```

Add your Groq key:
```
# .env.local
GROQ_API_KEY=your_key_here
```

Run:
```bash
npm run dev
```

Open **http://localhost:3000**

---

## Score guide

| Score | Color  | Meaning                        |
|-------|--------|--------------------------------|
| 8–10  | 🟢 Green  | Hot lead — high priority    |
| 5–7   | 🟡 Orange | Warm lead — follow up       |
| 1–4   | 🔴 Red    | Cold lead — low priority    |
