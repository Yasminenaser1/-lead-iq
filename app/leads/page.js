'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

/* ── helpers ── */
function scoreColor(s) {
  if (s >= 70) return '#22c55e';
  if (s >= 40) return '#f59e0b';
  if (s >  0)  return '#ef4444';
  return '#2a2a40';
}

const STATUS_DOTS = {
  New:          { color: '#8080a0', label: '○ New' },
  Contacted:    { color: '#60a5fa', label: '● Contacted' },
  Qualified:    { color: '#4ade80', label: '● Qualified' },
  Closed:       { color: '#f87171', label: '● Closed' },
  Disqualified: { color: '#fb923c', label: '● Disqualified' },
};

const STATUSES = ['New', 'Contacted', 'Qualified', 'Closed', 'Disqualified'];
const SIZES    = ['1–5', '6–20', '21–50', '51–200', '201–1000', '1000+'];

/* ── Score Bar ── */
function ScoreBar({ score }) {
  const color = scoreColor(score);
  if (!score) return <span style={{ color: '#404060', fontSize: 12 }}>—</span>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontWeight: 700, fontSize: 14, color, minWidth: 32 }}>{score}</span>
      <div style={{ flex: 1, height: 4, background: '#1e1e30', borderRadius: 2, overflow: 'hidden', minWidth: 80 }}>
        <div style={{
          width: `${score}%`, height: '100%', background: color,
          borderRadius: 2, transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}

/* ── AI Panel ── */
function AIPanel({ result, onClose }) {
  const [tab, setTab] = useState('RESEARCH');

  return (
    <div style={st.aiPanel}>
      <div style={st.aiPanelHeader}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['RESEARCH', 'SCORING', 'WRITER'].map(t => (
            <button key={t} style={{ ...st.aiTab, ...(tab === t ? st.aiTabActive : {}) }} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        <button style={st.closeBtn} onClick={onClose}>✕</button>
      </div>
      <div style={st.aiPanelBody}>
        {tab === 'RESEARCH' && (
          <div style={st.aiGrid}>
            {Object.entries(result.research || {}).map(([k, v]) => (
              <div key={k} style={st.aiKV}>
                <span style={st.aiKey}>{k.replace(/_/g, ' ')}</span>
                <span style={st.aiVal}>{v}</span>
              </div>
            ))}
          </div>
        )}
        {tab === 'SCORING' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: scoreColor(result.score) }}>
                {result.score}<span style={{ fontSize: 14, color: '#606080' }}>/100</span>
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: '#1e1e30', color: '#8080a0' }}>
                {result.scoring?.confidence?.toUpperCase()} CONFIDENCE
              </span>
            </div>
            {(result.scoring?.reasons || []).map((r, i) => (
              <div key={i} style={st.aiReason}>• {r}</div>
            ))}
          </div>
        )}
        {tab === 'WRITER' && (
          <p style={{ color: '#c0c0e0', fontSize: 13, lineHeight: 1.6 }}>
            {result.writer || result.score_reason || '—'}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Add Lead Modal ── */
function AddLeadModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ company: '', contact_name: '', email: '', title: '', company_size: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!form.company.trim() || !form.contact_name.trim()) { setErr('Company and Contact name are required.'); return; }
    setSaving(true);
    const res  = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(data.error || 'Save failed'); return; }
    onAdded(data); onClose();
  }

  const field = (label, key, type = 'text', ph = '') => (
    <label style={st.label}>
      <span style={st.labelText}>{label}</span>
      <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} style={st.input} />
    </label>
  );

  return (
    <div style={st.overlay} onClick={onClose}>
      <div style={st.modal} onClick={e => e.stopPropagation()}>
        <div style={st.modalHeader}>
          <h2 style={st.modalTitle}>Add New Lead</h2>
          <button style={st.closeBtn} onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit} style={st.form}>
          <div style={st.row2}>
            {field('Contact Name *', 'contact_name', 'text', 'Jane Smith')}
            {field('Company *', 'company', 'text', 'Blue Bottle Coffee')}
          </div>
          <div style={st.row2}>
            {field('Email', 'email', 'email', 'jane@example.com')}
            {field('Title', 'title', 'text', 'Founder / Head of Ops')}
          </div>
          <label style={st.label}>
            <span style={st.labelText}>Company Size</span>
            <select value={form.company_size} onChange={e => setForm(f => ({ ...f, company_size: e.target.value }))} style={st.input}>
              <option value="">Select…</option>
              {SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
            </select>
          </label>
          <label style={st.label}>
            <span style={st.labelText}>Notes</span>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any context…" rows={3} style={{ ...st.input, resize: 'vertical' }} />
          </label>
          {err && <p style={{ color: '#ef4444', fontSize: 12 }}>{err}</p>}
          <div style={st.modalFooter}>
            <button type="button" style={st.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={st.saveBtn} disabled={saving}>{saving ? 'Saving…' : 'Add Lead'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function LeadsPage() {
  const [leads, setLeads]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [filter, setFilter]     = useState('All');
  const [scoring, setScoring]   = useState(null);
  const [aiResult, setAiResult] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res  = await fetch('/api/leads');
    const data = await res.json();
    setLeads(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function analyze(lead) {
    setScoring(lead.id); setAiResult(null);
    const res  = await fetch('/api/leads/score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: lead.id }) });
    const data = await res.json();
    if (data.lead) setLeads(prev => prev.map(l => l.id === lead.id ? data.lead : l));
    setScoring(null);
    setAiResult({ leadId: lead.id, ...data });
  }

  async function changeStatus(lead, status) {
    const res  = await fetch(`/api/leads/${lead.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    const data = await res.json();
    setLeads(prev => prev.map(l => l.id === lead.id ? data : l));
  }

  async function deleteLead(id) {
    if (!confirm('Delete this lead?')) return;
    await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    setLeads(prev => prev.filter(l => l.id !== id));
    if (aiResult?.leadId === id) setAiResult(null);
  }

  const visible = filter === 'All' ? leads : leads.filter(l => l.status === filter);
  const scored  = leads.filter(l => l.score > 0);
  const avg     = scored.length ? Math.round(scored.reduce((a, l) => a + l.score, 0) / scored.length) : '—';

  return (
    <div style={st.page}>
      {/* Nav */}
      <header style={st.header}>
        <div style={st.logo}>
          <span style={st.logoIcon}>⚡</span>
          <span style={st.logoText}>LEAD IQ</span>
          <span style={st.dot}>●</span>
        </div>
        <nav style={st.nav}>
          <Link href="/" style={st.navLink}>HOME</Link>
          <button style={st.navLink2} onClick={() => setShowAdd(true)}>SUBMIT LEAD</button>
          <button style={{ ...st.navLink2, ...st.navActive }}>VIEW LEADS</button>
          <Link href="/monitor" style={st.navLink}>MONITOR</Link>
        </nav>
      </header>

      <div style={st.content}>
        {/* Page heading */}
        <div style={st.pageHead}>
          <div>
            <h1 style={st.pageTitle}>Lead Pipeline</h1>
            <p style={st.pageSubtitle}>All submitted leads, scored and ready for review.</p>
          </div>
          <button style={st.addBtn} onClick={() => setShowAdd(true)}>+ SUBMIT LEAD</button>
        </div>

        {/* Stat bar */}
        <div style={st.statBar}>
          {[
            { label: 'TOTAL LEADS',  val: leads.length },
            { label: 'NEW',          val: leads.filter(l => l.status === 'New').length },
            { label: 'QUALIFIED',    val: leads.filter(l => l.status === 'Qualified').length },
            { label: 'AVG AI SCORE', val: avg },
          ].map(s => (
            <div key={s.label} style={st.statCard}>
              <div style={st.statVal}>{s.val}</div>
              <div style={st.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={st.tabs}>
          {['All', ...STATUSES].map(t => (
            <button key={t} style={{ ...st.tab, ...(filter === t ? st.tabActive : {}) }} onClick={() => setFilter(t)}>
              {t}
              {t !== 'All' && (
                <span style={st.tabCount}>{leads.filter(l => l.status === t).length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={st.tableWrap}>
          {loading ? (
            <div style={st.empty}>Loading…</div>
          ) : visible.length === 0 ? (
            <div style={st.empty}>{leads.length === 0 ? 'No leads yet — click "+ SUBMIT LEAD" to get started.' : `No leads with status "${filter}".`}</div>
          ) : (
            <table style={st.table}>
              <thead>
                <tr>
                  {['NAME', 'COMPANY', 'EMAIL', 'TITLE', 'SIZE', 'SCORE', 'STATUS', ''].map(h => (
                    <th key={h} style={st.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map(lead => {
                  const dot = STATUS_DOTS[lead.status] || STATUS_DOTS.New;
                  const isActive = aiResult?.leadId === lead.id;
                  return (
                    <tr key={lead.id} style={{ ...st.tr, ...(isActive ? st.trActive : {}) }}>
                      <td style={st.td}>
                        <div style={st.nameCell}>{lead.contact_name}</div>
                        {lead.notes && <div style={st.notes}>{lead.notes.slice(0, 50)}{lead.notes.length > 50 ? '…' : ''}</div>}
                      </td>
                      <td style={{ ...st.td, color: '#a0a0c0' }}>{lead.company}</td>
                      <td style={{ ...st.td, color: '#606080', fontSize: 12 }}>{lead.email || '—'}</td>
                      <td style={{ ...st.td, color: '#8080a0', fontSize: 12 }}>{lead.title || '—'}</td>
                      <td style={{ ...st.td, color: '#8080a0', fontSize: 12 }}>{lead.company_size || '—'}</td>
                      <td style={{ ...st.td, minWidth: 130 }}><ScoreBar score={lead.score} /></td>
                      <td style={st.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <select
                            value={lead.status}
                            onChange={e => changeStatus(lead, e.target.value)}
                            style={{ background: 'none', border: 'none', color: dot.color, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                          >
                            {STATUSES.map(s => <option key={s} value={s} style={{ background: '#13131f', color: '#e8e8f0' }}>{STATUS_DOTS[s].label}</option>)}
                          </select>
                        </div>
                      </td>
                      <td style={{ ...st.td, whiteSpace: 'nowrap' }}>
                        <button
                          style={{ ...st.analyzeBtn, ...(isActive ? st.analyzeBtnActive : {}) }}
                          onClick={() => analyze(lead)}
                          disabled={scoring === lead.id}
                        >
                          {scoring === lead.id ? '…' : '⚡ Analyze'}
                        </button>
                        <button style={st.deleteBtn} onClick={() => deleteLead(lead.id)}>✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* AI Panel */}
      {aiResult && <AIPanel result={aiResult} onClose={() => setAiResult(null)} />}

      {showAdd && (
        <AddLeadModal onClose={() => setShowAdd(false)} onAdded={lead => setLeads(prev => [lead, ...prev])} />
      )}
    </div>
  );
}

/* ── Styles ── */
const st = {
  page:    { minHeight: '100vh', background: '#0b0b14', color: '#e8e8f0', fontFamily: 'monospace' },
  header:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', borderBottom: '1px solid #1e1e30', background: '#0d0d1a' },
  logo:    { display: 'flex', alignItems: 'center', gap: 8 },
  logoIcon: { fontSize: 18 },
  logoText: { fontSize: 16, fontWeight: 800, letterSpacing: '0.15em', background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  dot:     { color: '#f59e0b', fontSize: 8 },
  nav:     { display: 'flex', alignItems: 'center', gap: 4 },
  navLink: { fontSize: 11, fontWeight: 700, color: '#606080', padding: '6px 14px', letterSpacing: '0.08em', textDecoration: 'none' },
  navLink2: { fontSize: 11, fontWeight: 700, color: '#606080', padding: '6px 14px', letterSpacing: '0.08em', background: 'none', border: 'none', cursor: 'pointer' },
  navActive: { background: 'linear-gradient(135deg, #7c6cff22, #5b8ff022)', color: '#a0a0ff', border: '1px solid #3a3a60', borderRadius: 6 },

  content:    { padding: '32px 40px 120px' },
  pageHead:   { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 },
  pageTitle:  { fontSize: 36, fontWeight: 700, fontStyle: 'italic', letterSpacing: '-0.02em', marginBottom: 6 },
  pageSubtitle: { fontSize: 13, color: '#606080' },
  addBtn:     { background: '#d4a843', color: '#000', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', padding: '10px 20px', borderRadius: 6, border: 'none', cursor: 'pointer' },

  statBar:  { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#13131f', border: '1px solid #2a2a40', borderRadius: 10, padding: '16px 20px' },
  statVal:  { fontSize: 28, fontWeight: 700, marginBottom: 4 },
  statLabel: { fontSize: 10, color: '#606080', letterSpacing: '0.08em', fontWeight: 600 },

  tabs:     { display: 'flex', gap: 4, marginBottom: 0 },
  tab:      { background: 'none', color: '#8080a0', padding: '8px 14px', borderRadius: '6px 6px 0 0', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid transparent', borderBottom: 'none', marginBottom: -1, cursor: 'pointer' },
  tabActive: { background: '#13131f', color: '#e8e8f0', borderColor: '#2a2a40' },
  tabCount: { background: '#2a2a40', color: '#8080a0', fontSize: 10, fontWeight: 600, borderRadius: 10, padding: '1px 6px' },

  tableWrap: { background: '#13131f', border: '1px solid #2a2a40', borderRadius: '0 8px 8px 8px', overflow: 'auto' },
  empty:    { padding: '60px 0', textAlign: 'center', color: '#606080', fontSize: 14 },
  table:    { width: '100%', borderCollapse: 'collapse' },
  th:       { textAlign: 'left', padding: '12px 16px', fontSize: 10, fontWeight: 600, color: '#404060', letterSpacing: '0.1em', borderBottom: '1px solid #2a2a40', background: '#0f0f1e' },
  tr:       { borderBottom: '1px solid #1a1a2e' },
  trActive: { background: '#13132a' },
  td:       { padding: '14px 16px', verticalAlign: 'middle' },
  nameCell: { fontWeight: 600, fontSize: 14, color: '#e8e8f0' },
  notes:    { fontSize: 11, color: '#606080', marginTop: 3 },

  analyzeBtn:       { background: '#1c1c38', color: '#a0a0ff', border: '1px solid #3a3a60', padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, marginRight: 6, cursor: 'pointer' },
  analyzeBtnActive: { background: '#2a2a50', borderColor: '#6060c0' },
  deleteBtn:        { background: 'none', color: '#404060', border: '1px solid #2a2a40', padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' },

  aiPanel:       { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0f0f1e', borderTop: '1px solid #2a2a40', zIndex: 200 },
  aiPanelHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 40px 0' },
  aiTab:         { background: 'none', color: '#606080', border: 'none', padding: '8px 16px', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', borderBottom: '2px solid transparent', cursor: 'pointer' },
  aiTabActive:   { color: '#a0a0ff', borderBottomColor: '#7c6cff' },
  aiPanelBody:   { padding: '12px 40px 20px', minHeight: 80 },
  aiGrid:        { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  aiKV:          { background: '#13131f', border: '1px solid #2a2a40', borderRadius: 8, padding: '10px 14px' },
  aiKey:         { display: 'block', fontSize: 10, color: '#606080', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 },
  aiVal:         { fontSize: 13, fontWeight: 600, color: '#c0c0e0', textTransform: 'capitalize' },
  aiReason:      { fontSize: 13, color: '#8080b0', padding: '4px 0', lineHeight: 1.5 },

  overlay:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:       { background: '#13131f', border: '1px solid #2a2a40', borderRadius: 12, width: 540, maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' },
  modalTitle:  { fontSize: 16, fontWeight: 700 },
  closeBtn:    { background: 'none', color: '#606080', fontSize: 16, padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer' },
  form:        { padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 },
  row2:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  label:       { display: 'flex', flexDirection: 'column', gap: 4 },
  labelText:   { fontSize: 12, fontWeight: 500, color: '#8080a0' },
  input:       { width: '100%' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
  cancelBtn:   { background: 'none', color: '#8080a0', border: '1px solid #2a2a40', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' },
  saveBtn:     { background: 'linear-gradient(135deg, #7c6cff, #5b8ff0)', color: '#fff', fontWeight: 600, padding: '8px 20px', borderRadius: 6, border: 'none', cursor: 'pointer' },
};
