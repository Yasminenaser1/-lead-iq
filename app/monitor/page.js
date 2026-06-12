'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MonitorPage() {
  const [leads, setLeads] = useState([]);
  const [time, setTime]   = useState('');

  useEffect(() => {
    async function load() {
      const res  = await fetch('/api/leads');
      const data = await res.json();
      setLeads(data);
    }
    load();
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const scored       = leads.filter(l => l.score > 0);
  const total        = leads.length;
  const completed    = scored.length;
  const needsReview  = leads.filter(l => l.score === 0).length;
  const inProgress   = 0;
  const successRate  = total > 0 ? Math.round((completed / total) * 100) : 0;

  const agentStats = [
    { name: 'research', failures: 0 },
    { name: 'scoring',  failures: 0 },
    { name: 'writer',   failures: 0 },
  ];

  return (
    <div style={st.page}>
      {/* Nav */}
      <header style={st.header}>
        <div style={st.logo}>
          <span>⚡</span>
          <span style={st.logoText}>LEAD IQ</span>
          <span style={st.dot}>●</span>
        </div>
        <nav style={st.nav}>
          <Link href="/"       style={st.navLink}>HOME</Link>
          <Link href="/leads"  style={st.navLink}>SUBMIT LEAD</Link>
          <Link href="/leads"  style={st.navLink}>VIEW LEADS</Link>
          <span style={{ ...st.navLink, ...st.navActive }}>MONITOR</span>
        </nav>
      </header>

      <div style={st.content}>
        <div style={st.breadcrumb}>HOME / <span style={{ color: '#e8e8f0' }}>MONITORING</span></div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={st.pageTitle}>Agent Monitor</h1>
            <p style={st.pageSubtitle}>Live stats for the lead qualification pipeline.</p>
          </div>
          <div style={st.liveTag}>
            <span style={st.liveDot}>●</span>
            <span style={{ color: '#606080', fontSize: 12 }}>updated {time}</span>
          </div>
        </div>

        {/* Stat cards */}
        <div style={st.statGrid}>
          {[
            { label: 'TOTAL JOBS',     val: total,        color: '#e8e8f0' },
            { label: 'COMPLETE',       val: completed,    color: '#4ade80' },
            { label: 'NEEDS REVIEW',   val: needsReview,  color: '#e8e8f0' },
            { label: 'IN PROGRESS',    val: inProgress,   color: '#e8e8f0' },
            { label: 'SUCCESS RATE',   val: `${successRate}%`, color: '#4ade80', sub: `${completed} of ${total}` },
            { label: 'AGENT FAILURES', val: 0,            color: '#e8e8f0', sub: 'total retries logged' },
          ].map(s => (
            <div key={s.label} style={st.statCard}>
              <div style={st.statLabel}>{s.label}</div>
              <div style={{ ...st.statVal, color: s.color }}>{s.val}</div>
              {s.sub && <div style={st.statSub}>{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* Failures by agent */}
        <div style={st.section}>
          <div style={st.sectionLabel}>FAILURES BY AGENT</div>
          {agentStats.map(a => (
            <div key={a.name} style={st.agentRow}>
              <span style={st.agentName}>{a.name}</span>
              <div style={st.barTrack}>
                <div style={{ ...st.barFill, width: `${Math.min(a.failures * 10, 100)}%` }} />
              </div>
              <span style={st.agentCount}>{a.failures}</span>
            </div>
          ))}
        </div>

        {/* Recent leads */}
        <div style={st.section}>
          <div style={st.sectionLabel}>RECENT PIPELINE JOBS</div>
          <table style={st.table}>
            <thead>
              <tr>
                {['LEAD', 'COMPANY', 'SCORE', 'STATUS', 'RESULT'].map(h => (
                  <th key={h} style={st.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 10).map(lead => (
                <tr key={lead.id} style={st.tr}>
                  <td style={st.td}>{lead.contact_name}</td>
                  <td style={{ ...st.td, color: '#8080a0' }}>{lead.company}</td>
                  <td style={{ ...st.td, color: lead.score >= 70 ? '#4ade80' : lead.score >= 40 ? '#f59e0b' : lead.score > 0 ? '#ef4444' : '#606080' }}>
                    {lead.score > 0 ? `${lead.score}/100` : '—'}
                  </td>
                  <td style={st.td}>{lead.status}</td>
                  <td style={{ ...st.td, color: lead.score > 0 ? '#4ade80' : '#606080' }}>
                    {lead.score > 0 ? '✓ complete' : '○ pending'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const st = {
  page:    { minHeight: '100vh', background: '#0b0b14', color: '#e8e8f0', fontFamily: 'monospace' },
  header:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', borderBottom: '1px solid #1e1e30', background: '#0d0d1a' },
  logo:    { display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 },
  logoText: { fontWeight: 800, letterSpacing: '0.15em', background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  dot:     { color: '#f59e0b', fontSize: 8 },
  nav:     { display: 'flex', alignItems: 'center', gap: 4 },
  navLink: { fontSize: 11, fontWeight: 700, color: '#606080', padding: '6px 14px', letterSpacing: '0.08em', textDecoration: 'none' },
  navActive: { color: '#a0a0ff', background: '#1c1c38', border: '1px solid #3a3a60', borderRadius: 6 },

  content:     { padding: '32px 40px 80px' },
  breadcrumb:  { fontSize: 11, color: '#404060', letterSpacing: '0.08em', marginBottom: 20 },
  pageTitle:   { fontSize: 36, fontWeight: 700, fontStyle: 'italic', letterSpacing: '-0.02em', marginBottom: 6 },
  pageSubtitle: { fontSize: 13, color: '#606080' },
  liveTag:     { display: 'flex', alignItems: 'center', gap: 8 },
  liveDot:     { color: '#4ade80', fontSize: 10, animation: 'pulse 2s infinite' },

  statGrid:  { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 32 },
  statCard:  { background: '#13131f', border: '1px solid #2a2a40', borderRadius: 10, padding: '20px' },
  statLabel: { fontSize: 10, color: '#606080', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 8 },
  statVal:   { fontSize: 32, fontWeight: 700 },
  statSub:   { fontSize: 11, color: '#606080', marginTop: 4 },

  section:      { background: '#13131f', border: '1px solid #2a2a40', borderRadius: 10, padding: '20px 24px', marginBottom: 20 },
  sectionLabel: { fontSize: 10, color: '#606080', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 16 },
  agentRow:     { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  agentName:    { fontSize: 12, color: '#8080a0', minWidth: 80 },
  barTrack:     { flex: 1, height: 4, background: '#1e1e30', borderRadius: 2 },
  barFill:      { height: '100%', background: '#ef4444', borderRadius: 2 },
  agentCount:   { fontSize: 12, color: '#606080', minWidth: 20, textAlign: 'right' },

  table: { width: '100%', borderCollapse: 'collapse' },
  th:    { textAlign: 'left', padding: '10px 12px', fontSize: 10, fontWeight: 600, color: '#404060', letterSpacing: '0.1em', borderBottom: '1px solid #2a2a40' },
  tr:    { borderBottom: '1px solid #1a1a2e' },
  td:    { padding: '12px', fontSize: 13 },
};
