import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import Groq from 'groq-sdk';

export async function POST(request) {
  try {
    const { leadId } = await request.json();
    const db   = readDb();
    const idx  = db.leads.findIndex(l => l.id === leadId);

    if (idx === -1) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    const lead = db.leads[idx];

    const groqKey = (process.env.GROQ_API_KEY || '').trim();
    console.log('KEY CHECK:', groqKey ? `found (${groqKey.slice(0,8)}...)` : 'MISSING');

    // No API key — return a demo score
    if (!groqKey || groqKey === 'paste_your_key_here') {
      const score  = Math.floor(Math.random() * 40) + 50;
      const research = { industry: 'coffee shop', seniority: lead.title || 'unknown', budget_holder: 'unknown', follow_up: 'yes' };
      const scoring  = { score, confidence: 'medium', reasons: ['Demo mode — add GROQ_API_KEY for real AI scoring'] };
      const writer   = 'Demo mode — add your GROQ_API_KEY to .env.local for real AI scoring.';
      db.leads[idx] = { ...lead, score, score_reason: writer };
      writeDb(db);
      return NextResponse.json({ score, research, scoring, writer, lead: db.leads[idx] });
    }

    const client = new Groq({ apiKey: groqKey });

    // Step 1 — Research
    const researchPrompt = `You are a B2B sales researcher for coffee shop equipment and services.
Analyze this lead and extract key qualification signals.

Company: ${lead.company}
Contact: ${lead.contact_name}${lead.title ? ` (${lead.title})` : ''}
Size: ${lead.company_size || 'Unknown'}
Notes: ${lead.notes || 'None'}

Reply in this exact JSON only:
{"industry": "one word", "seniority": "owner/manager/staff/unknown", "budget_holder": "yes/no/unknown", "follow_up": "yes/no"}`;

    const r1 = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: researchPrompt }],
      max_tokens: 80, temperature: 0.2,
    });
    const researchRaw = r1.choices[0].message.content.trim();
    const research = JSON.parse(researchRaw.match(/\{[\s\S]*?\}/)[0]);

    // Step 2 — Scoring (0-100)
    const scorePrompt = `You are a B2B sales qualification expert for coffee shop equipment and services.

Score this lead from 0-100 on likelihood to buy:

Company: ${lead.company}
Contact: ${lead.contact_name}${lead.title ? ` (${lead.title})` : ''}
Size: ${lead.company_size || 'Unknown'}
Notes: ${lead.notes || 'None'}
Research signals: budget_holder=${research.budget_holder}, seniority=${research.seniority}

Scoring guide:
- 80-100: Decision maker, large chain, clear budget
- 50-79: Owner or manager, mid-size, genuine interest
- 20-49: Staff, small shop, possible but slow
- 0-19: Wrong fit, no authority

Reply in this exact JSON only:
{"score": 75, "confidence": "high/medium/low", "reasons": ["reason 1", "reason 2"]}`;

    const r2 = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: scorePrompt }],
      max_tokens: 120, temperature: 0.2,
    });
    const scoringRaw = r2.choices[0].message.content.trim();
    const scoring = JSON.parse(scoringRaw.match(/\{[\s\S]*?\}/)[0]);

    // Step 3 — Writer
    const writerPrompt = `Write one concise sentence (max 20 words) summarizing why this lead scored ${scoring.score}/100.
Reasons: ${scoring.reasons.join(', ')}
Reply with just the sentence, no quotes.`;

    const r3 = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: writerPrompt }],
      max_tokens: 60, temperature: 0.3,
    });
    const writer = r3.choices[0].message.content.trim();

    db.leads[idx] = { ...lead, score: scoring.score, score_reason: writer };
    writeDb(db);

    return NextResponse.json({ score: scoring.score, research, scoring, writer, lead: db.leads[idx] });
  } catch (err) {
    console.error('Score error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
