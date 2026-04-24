import { useState } from 'react';
import { Button, Space, Typography, Tag, Input } from 'antd';
import { ArrowLeftOutlined, CopyOutlined, ApiOutlined, KeyOutlined, CheckCircleFilled } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    id: 'auth',
    title: 'Authentication',
    description: 'All authenticated endpoints accept a Bearer JWT token in the Authorization header.',
    endpoints: [
      { method: 'POST', path: '/auth/register', auth: false, desc: 'Create a user account.' },
      { method: 'POST', path: '/auth/login', auth: false, desc: 'Exchange credentials for an access token.' },
      { method: 'GET',  path: '/auth/me', auth: true, desc: 'Get the authenticated user.' },
    ],
  },
  {
    id: 'factories',
    title: 'Factories',
    description: 'Manage factory registrations, profiles, and teams.',
    endpoints: [
      { method: 'POST',   path: '/factories', auth: true, desc: 'Register a new factory.' },
      { method: 'GET',    path: '/factories', auth: true, desc: 'List your factories.' },
      { method: 'GET',    path: '/factories/{id}', auth: true, desc: 'Get a factory.' },
      { method: 'PUT',    path: '/factories/{id}', auth: true, desc: 'Update a factory.' },
      { method: 'GET',    path: '/factories/{id}/team', auth: true, desc: 'List team members.' },
      { method: 'POST',   path: '/factories/{id}/team', auth: true, desc: 'Invite a member.' },
      { method: 'PUT',    path: '/factories/{id}/team/{userId}/role', auth: true, desc: 'Change a member\'s role.' },
      { method: 'DELETE', path: '/factories/{id}/team/{userId}', auth: true, desc: 'Remove a member.' },
    ],
  },
  {
    id: 'assessments',
    title: 'Assessments',
    description: 'SIRI self-assessments across the 16 dimensions.',
    endpoints: [
      { method: 'POST', path: '/assessments', auth: true, desc: 'Start a new assessment for a factory.' },
      { method: 'GET',  path: '/assessments/{id}', auth: true, desc: 'Get assessment + questions + responses.' },
      { method: 'PUT',  path: '/assessments/{id}/dimensions/{code}', auth: true, desc: 'Save a dimension response (0-5).' },
      { method: 'POST', path: '/assessments/{id}/submit', auth: true, desc: 'Submit the assessment.' },
      { method: 'GET',  path: '/assessments/history?factoryId=', auth: true, desc: 'Full history.' },
    ],
  },
  {
    id: 'gaps',
    title: 'Gap Analysis',
    endpoints: [
      { method: 'POST', path: '/gap-analysis', auth: true, desc: 'Generate a gap analysis.' },
      { method: 'GET',  path: '/gap-analysis/latest?factoryId=', auth: true, desc: 'Latest for a factory.' },
      { method: 'GET',  path: '/gap-analysis/{id}', auth: true, desc: 'Get a specific gap analysis.' },
    ],
  },
  {
    id: 'roadmap',
    title: 'Roadmaps',
    endpoints: [
      { method: 'GET',  path: '/roadmaps/latest?factoryId=', auth: true, desc: 'Latest roadmap with phases/initiatives/milestones.' },
      { method: 'POST', path: '/roadmaps/{id}/approve', auth: true, desc: 'Approve a roadmap.' },
      { method: 'PUT',  path: '/roadmaps/milestones/{mid}/complete', auth: true, desc: 'Mark milestone complete.' },
      { method: 'PUT',  path: '/roadmaps/initiatives/{iid}/progress', auth: true, desc: 'Update initiative progress %.' },
    ],
  },
  {
    id: 'certificates',
    title: 'Certificates',
    endpoints: [
      { method: 'GET', path: '/certificates/latest?factoryId=', auth: true, desc: 'Get current certificate.' },
      { method: 'GET', path: '/certificates/verify/{code}', auth: false, desc: 'Public certificate verification.' },
    ],
  },
  {
    id: 'ai',
    title: 'AI Assistant',
    endpoints: [
      { method: 'POST', path: '/ai/chat', auth: true, desc: 'Converse with the assistant (`{ factoryId, message, lang }`).' },
    ],
  },
  {
    id: 'public',
    title: 'Public',
    description: 'No authentication required.',
    endpoints: [
      { method: 'GET', path: '/public/stats', auth: false, desc: 'National headline stats.' },
      { method: 'GET', path: '/public/map', auth: false, desc: 'Anonymized factory map points.' },
    ],
  },
  {
    id: 'gov',
    title: 'Government Portal',
    description: 'Requires government scope JWT. Region-scoped users are automatically filtered.',
    endpoints: [
      { method: 'POST', path: '/gov/auth/login', auth: false, desc: 'Gov user login.' },
      { method: 'GET',  path: '/gov/dashboard/summary', auth: true, desc: 'National KPIs.' },
      { method: 'GET',  path: '/gov/dashboard/map', auth: true, desc: 'All factories with coordinates & scores.' },
      { method: 'GET',  path: '/gov/dashboard/regions', auth: true, desc: 'Regional breakdown.' },
      { method: 'GET',  path: '/gov/dashboard/sectors', auth: true, desc: 'Sector breakdown.' },
      { method: 'GET',  path: '/gov/dashboard/trends', auth: true, desc: '12-month SIRI trend.' },
      { method: 'GET',  path: '/gov/dashboard/activity', auth: true, desc: 'Live activity feed.' },
      { method: 'GET',  path: '/gov/dashboard/heatmap', auth: true, desc: 'Industry × dimension heatmap.' },
      { method: 'GET',  path: '/gov/dashboard/leaderboard', auth: true, desc: 'Top factories.' },
      { method: 'GET',  path: '/gov/dashboard/score-distribution', auth: true, desc: 'Score distribution bands.' },
      { method: 'GET',  path: '/gov/search/factories?q=&industry=&region=', auth: true, desc: 'Factory search.' },
      { method: 'POST', path: '/gov/compare', auth: true, desc: 'Compare multiple factories.' },
      { method: 'GET',  path: '/gov/alerts', auth: true, desc: 'Open compliance alerts.' },
      { method: 'PUT',  path: '/gov/alerts/{id}/resolve', auth: true, desc: 'Resolve an alert.' },
    ],
  },
];

const METHOD_COLOR: Record<string, string> = {
  GET: '#0ea5e9',
  POST: '#006C35',
  PUT: '#f59e0b',
  DELETE: '#dc2626',
};

export default function ApiDocsPage() {
  const [active, setActive] = useState(SECTIONS[0].id);

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ color: 'var(--color-ink-800)' }}><ArrowLeftOutlined /> Back to home</Link>
          <Space><ApiOutlined /> <strong>VeeSIRI API · v1</strong></Space>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 40 }}>
        <Tag className="chip chip--brand" style={{ marginBottom: 16 }}>Developer reference</Tag>
        <h1 className="display-1">VeeSIRI REST API</h1>
        <Typography.Paragraph style={{ fontSize: 17, color: 'var(--color-ink-500)', maxWidth: 720, marginTop: 12 }}>
          Base URL: <code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 4 }}>https://api.veesiri.sa/api/v1</code>.
          All responses are JSON. Authentication is via Bearer JWT tokens obtained from the <code>/auth/login</code> endpoint.
        </Typography.Paragraph>

        {/* Quick-start */}
        <div
          style={{
            marginTop: 28, padding: 24, background: '#0b1220', color: '#e2e8f0', borderRadius: 12,
            fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 13, lineHeight: 1.6,
          }}
        >
          <div style={{ color: '#94a3b8', marginBottom: 10, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            QUICK START
          </div>
          <div><span style={{ color: '#C8A548' }}># 1. Authenticate</span></div>
          <div>curl -X POST https://api.veesiri.sa/api/v1/auth/login \</div>
          <div>&nbsp;&nbsp;-H "Content-Type: application/json" \</div>
          <div>&nbsp;&nbsp;-d {"'"}{"{"}"email":"demo@veesiri.sa","password":"demo12345"{"}"}{"'"}</div>
          <div style={{ marginTop: 12 }}><span style={{ color: '#C8A548' }}># 2. Use the access token</span></div>
          <div>curl -H "Authorization: Bearer $TOKEN" \</div>
          <div>&nbsp;&nbsp;https://api.veesiri.sa/api/v1/factories</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, marginTop: 40 }}>
          {/* Sidebar */}
          <aside style={{ position: 'sticky', top: 90, alignSelf: 'flex-start', maxHeight: 'calc(100vh - 120px)', overflow: 'auto' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Sections
            </div>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setActive(s.id)}
                style={{
                  display: 'block',
                  padding: '8px 12px',
                  borderRadius: 8,
                  color: active === s.id ? 'var(--color-primary)' : 'var(--color-ink-700)',
                  background: active === s.id ? 'var(--color-primary-50)' : 'transparent',
                  fontWeight: active === s.id ? 600 : 400,
                  fontSize: 14,
                  marginBottom: 2,
                }}
              >
                {s.title}
              </a>
            ))}
            <div style={{ marginTop: 20, padding: 14, background: '#f8fafc', borderRadius: 10 }}>
              <KeyOutlined style={{ color: '#C8A548' }} />
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>API Keys</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                Available on Professional + plans. Request via Settings → API.
              </div>
            </div>
          </aside>

          {/* Main */}
          <main>
            {SECTIONS.map((s) => (
              <section key={s.id} id={s.id} style={{ marginBottom: 48 }}>
                <h2 className="display-2" style={{ marginBottom: 6 }}>{s.title}</h2>
                {s.description && (
                  <Typography.Paragraph type="secondary">{s.description}</Typography.Paragraph>
                )}
                <div style={{ display: 'grid', gap: 10 }}>
                  {s.endpoints.map((e) => (
                    <div
                      key={e.path + e.method}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: 10,
                        padding: '14px 16px',
                        display: 'flex', alignItems: 'center', gap: 12,
                      }}
                    >
                      <Tag
                        style={{
                          background: METHOD_COLOR[e.method],
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 11,
                          border: 'none',
                          minWidth: 60, textAlign: 'center',
                        }}
                      >
                        {e.method}
                      </Tag>
                      <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, flex: 1 }}>
                        {e.path}
                      </code>
                      {e.auth ? (
                        <Tag color="gold">Auth required</Tag>
                      ) : (
                        <Tag color="green">Public</Tag>
                      )}
                      <span style={{ fontSize: 12, color: '#64748b', flex: 2, textAlign: 'end' }}>
                        {e.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}
