# ⚡ Lead IQ — AI-Powered Coffee Shop Sales Pipeline

A Next.js app that tracks sales leads for coffee shop equipment and services, scoring each lead 0–100 using a 3-step Groq AI pipeline so your team knows exactly who to call first.

**GitHub:** https://github.com/Yasminenaser1/-lead-iq

---

## What it does

- Add leads (company, contact, title, size, notes)
- Click **⚡ Analyze** — Groq AI runs a 3-step pipeline: Research → Scoring → Writer
- Score out of 100 shown as a color-coded progress bar
- Track status: New → Contacted → Qualified → Closed → Disqualified
- Filter leads by status with a tab bar
- Dashboard shows total leads, new count, qualified count, and average AI score
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

## AI Pipeline

Each lead goes through 3 AI steps when you click ⚡ Analyze:

1. **Research** — extracts industry, seniority, budget authority, follow-up readiness
2. **Scoring** — scores 0–100 with confidence level and reasons
3. **Writer** — one-sentence summary of the score

---

## Score guide

| Score  | Color     | Meaning                        |
|--------|-----------|--------------------------------|
| 70–100 | 🟢 Green  | Hot lead — high priority       |
| 40–69  | 🟡 Orange | Warm lead — follow up          |
| 1–39   | 🔴 Red    | Cold lead — low priority       |
