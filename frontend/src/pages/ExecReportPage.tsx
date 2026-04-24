import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Spin, Tag } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import ReactECharts from 'echarts-for-react';
import { api } from '../api/client';
import ScoreRing from '../components/ScoreRing';

const scoreColor = (v: number) =>
  v >= 4 ? '#059669' : v >= 3 ? '#84cc16' : v >= 2 ? '#eab308' : v >= 1 ? '#f97316' : '#dc2626';

const SEV_COLOR: Record<string, string> = {
  CRITICAL: '#dc2626', MODERATE: '#f97316', MINOR: '#eab308', ON_TRACK: '#059669',
};

export default function ExecReportPage() {
  const { factoryId } = useParams();
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const { data: factory } = useQuery<any>({
    queryKey: ['factory', factoryId],
    queryFn: async () => (await api.get(`/factories/${factoryId}`)).data,
  });
  const { data: gap } = useQuery<any>({
    queryKey: ['gap-latest', factoryId],
    queryFn: async () => (await api.get(`/gap-analysis/latest?factoryId=${factoryId}`)).data,
  });
  const { data: roadmap } = useQuery<any>({
    queryKey: ['roadmap', factoryId],
    queryFn: async () => (await api.get(`/roadmaps/latest?factoryId=${factoryId}`)).data,
  });
  const { data: cert } = useQuery<any>({
    queryKey: ['cert', factoryId],
    queryFn: async () => (await api.get(`/certificates/latest?factoryId=${factoryId}`)).data,
  });
  const { data: recs } = useQuery<any[]>({
    queryKey: ['recs', factoryId],
    queryFn: async () => (await api.get(`/recommendations?factoryId=${factoryId}`)).data,
  });

  if (!factory || !gap) return <div style={{ display: 'grid', placeItems: 'center', height: '80vh' }}><Spin /></div>;

  const latest = factory.assessments?.[0];
  const overall = latest ? Number(latest.overallScore) : 0;
  const processS = latest ? Number(latest.processScore) : 0;
  const technology = latest ? Number(latest.technologyScore) : 0;
  const organization = latest ? Number(latest.organizationScore) : 0;

  const radarOption = {
    radar: {
      indicator: [
        { name: 'Process', max: 5 },
        { name: 'Technology', max: 5 },
        { name: 'Organization', max: 5 },
      ],
      splitArea: { areaStyle: { color: ['rgba(0,108,53,0.02)', 'rgba(0,108,53,0.05)'] } },
      axisName: { color: '#1a2f4e', fontWeight: 600 },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [processS, technology, organization],
            name: 'Current',
            areaStyle: { color: 'rgba(0,108,53,0.25)' },
            lineStyle: { color: '#006C35', width: 3 },
          },
          {
            value: [Number(gap.targetOverallScore), Number(gap.targetOverallScore), Number(gap.targetOverallScore)],
            name: 'Target',
            areaStyle: { color: 'rgba(200,165,72,0.1)' },
            lineStyle: { color: '#C8A548', type: 'dashed' },
          },
        ],
      },
    ],
  };

  const phases = roadmap?.phases ?? [];
  const totalInitiatives = phases.flatMap((p: any) => p.initiatives ?? []).length;
  const totalBudget = Number(roadmap?.totalBudgetSar ?? 0);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Toolbar (no-print) */}
      <div
        className="no-print"
        style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)',
          padding: '12px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <div>
          <Tag color="green">Executive Report</Tag>
          <span style={{ color: '#64748b', fontSize: 13 }}>
            {isAr ? factory.nameAr : factory.nameEn}
          </span>
        </div>
        <div>
          <Button icon={<PrinterOutlined />} type="primary" onClick={() => window.print()}>
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Report body */}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: 40 }}>
        {/* Page 1 — Cover */}
        <div
          className="print-page"
          style={{
            background: '#fff',
            padding: '72px 60px',
            borderRadius: 16,
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            overflow: 'hidden',
            minHeight: 780,
          }}
        >
          <div
            style={{
              position: 'absolute', top: 0, insetInlineStart: 0, right: 0,
              height: 120, background: 'var(--gradient-hero)',
            }}
          />
          <div style={{ position: 'relative', color: '#fff', paddingTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 46, height: 46, background: 'rgba(255,255,255,0.15)',
                  borderRadius: 10, display: 'grid', placeItems: 'center',
                  fontWeight: 800, fontSize: 22, color: '#fff',
                }}
              >V</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>VeeSIRI Platform</div>
                <div style={{ fontSize: 11, letterSpacing: '0.14em', opacity: 0.85 }}>
                  SMART INDUSTRY READINESS INDEX
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 80 }}>
            <div className="eyebrow">Executive Assessment Report</div>
            <h1 className="display-1" style={{ marginTop: 14 }}>
              {isAr ? factory.nameAr : factory.nameEn}
            </h1>
            <div style={{ marginTop: 10, color: '#64748b', fontSize: 14 }}>
              CR {factory.crNumber} · {factory.industryGroup.replace(/_/g, ' ')} · {factory.region}, {factory.city}
            </div>
          </div>

          <div style={{ marginTop: 60, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
            <div>
              <div className="eyebrow">Overall SIRI</div>
              <div
                style={{
                  fontSize: 88, fontWeight: 800, lineHeight: 1,
                  color: scoreColor(overall), fontVariantNumeric: 'tabular-nums',
                }}
              >
                {overall.toFixed(2)}
              </div>
              <div style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
                out of 5.00 · Target: {Number(gap.targetOverallScore).toFixed(2)}
              </div>
              <div style={{ marginTop: 20, display: 'flex', gap: 14 }}>
                {[
                  { label: 'Process', value: processS },
                  { label: 'Technology', value: technology },
                  { label: 'Organization', value: organization },
                ].map((b) => (
                  <div key={b.label} style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 22, fontWeight: 700,
                        color: scoreColor(b.value), fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {b.value.toFixed(2)}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {b.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <ScoreRing score={overall} label="SIRI" size={220} thickness={18} />
            </div>
          </div>

          {cert && (
            <div
              style={{
                marginTop: 60, padding: '18px 24px',
                background: '#f0fdf4', borderRadius: 12,
                border: '1px solid #86efac',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: '#059669', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Certificate of Compliance
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
                  Code: <code>{cert.verificationCode}</code>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Issued {new Date(cert.issuedDate).toLocaleDateString()} · Valid until {new Date(cert.expiryDate).toLocaleDateString()}
              </div>
            </div>
          )}

          <div style={{ position: 'absolute', bottom: 28, insetInlineStart: 60, right: 60, fontSize: 11, color: '#94a3b8' }}>
            Generated {new Date().toLocaleDateString()} · VeeSIRI by Veebase LLC
          </div>
        </div>

        {/* Page 2 — Radar + Gap matrix */}
        <div
          className="print-page"
          style={{ background: '#fff', padding: '48px 60px', borderRadius: 16, boxShadow: 'var(--shadow-lg)', marginTop: 40 }}
        >
          <div className="eyebrow">Section 1</div>
          <h2 className="display-2">Maturity profile</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 24, alignItems: 'center' }}>
            <ReactECharts option={radarOption} style={{ height: 360 }} />
            <div>
              <div style={{ marginBottom: 14 }}>
                <div className="eyebrow">Headline</div>
                <p style={{ fontSize: 16, marginTop: 6 }}>
                  {isAr
                    ? `يحقق ${factory.nameAr} مستوى SIRI ${overall.toFixed(2)} من 5. الفجوة الإجمالية للهدف ${Number(gap.targetOverallScore).toFixed(2)} هي ${Number(gap.overallGap).toFixed(2)} نقطة.`
                    : `${factory.nameEn} achieves SIRI level ${overall.toFixed(2)} of 5. Gap to target ${Number(gap.targetOverallScore).toFixed(2)} is ${Number(gap.overallGap).toFixed(2)} points.`}
                </p>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {[
                  { label: 'Process gap', v: Number(gap.processGap) },
                  { label: 'Technology gap', v: Number(gap.technologyGap) },
                  { label: 'Organization gap', v: Number(gap.organizationGap) },
                ].map((r) => (
                  <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: '0 0 150px', fontSize: 13, color: '#64748b' }}>{r.label}</div>
                    <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(r.v / 5) * 100}%`, background: '#f97316' }} />
                    </div>
                    <div style={{ flex: '0 0 50px', textAlign: 'end', fontWeight: 700 }}>
                      {r.v.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 40 }}>
            <div className="eyebrow">Section 2</div>
            <h2 className="display-2">Prioritized gap matrix</h2>
            <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1a2f4e' }}>
                  <th style={{ textAlign: 'start', padding: 8 }}>#</th>
                  <th style={{ textAlign: 'start', padding: 8 }}>Dim</th>
                  <th style={{ padding: 8 }}>Current</th>
                  <th style={{ padding: 8 }}>Gap</th>
                  <th style={{ padding: 8 }}>Severity</th>
                  <th style={{ padding: 8 }}>Effort</th>
                  <th style={{ padding: 8 }}>Cost (SAR)</th>
                  <th style={{ padding: 8 }}>Flags</th>
                </tr>
              </thead>
              <tbody>
                {(gap.dimensionGaps ?? []).slice(0, 12).map((g: any) => (
                  <tr key={g.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: 8 }}>{g.priorityRank}</td>
                    <td style={{ padding: 8, fontWeight: 600 }}>{g.dimensionCode}</td>
                    <td style={{ padding: 8, textAlign: 'center' }}>{Number(g.currentScore).toFixed(2)}</td>
                    <td style={{ padding: 8, textAlign: 'center', fontWeight: 600 }}>
                      {Number(g.gapMagnitude).toFixed(2)}
                    </td>
                    <td style={{ padding: 8, textAlign: 'center' }}>
                      <span
                        style={{
                          background: SEV_COLOR[g.severity], color: '#fff',
                          padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                        }}
                      >
                        {g.severity}
                      </span>
                    </td>
                    <td style={{ padding: 8, textAlign: 'center' }}>{g.estimatedEffortMonths}mo</td>
                    <td style={{ padding: 8, textAlign: 'end' }}>
                      {Number(g.estimatedCostSar).toLocaleString()}
                    </td>
                    <td style={{ padding: 8, textAlign: 'center' }}>
                      {g.isQuickWin && <Tag color="blue">Quick</Tag>}
                      {g.isSidfRelevant && <Tag color="purple">SIDF</Tag>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Page 3 — Roadmap + Recs */}
        <div
          className="print-page"
          style={{ background: '#fff', padding: '48px 60px', borderRadius: 16, boxShadow: 'var(--shadow-lg)', marginTop: 40 }}
        >
          <div className="eyebrow">Section 3</div>
          <h2 className="display-2">Transformation roadmap</h2>
          {roadmap ? (
            <>
              <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                <Stat label="Phases" value={phases.length} />
                <Stat label="Initiatives" value={totalInitiatives} />
                <Stat label="Budget (SAR M)" value={(totalBudget / 1_000_000).toFixed(2)} />
                <Stat label="Duration" value={`${Math.round((new Date(roadmap.endDate).getTime() - new Date(roadmap.startDate).getTime()) / (30 * 24 * 3600 * 1000))} mo`} />
              </div>
              <div style={{ marginTop: 24 }}>
                {phases.map((p: any) => (
                  <div key={p.id} style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                      <span
                        style={{
                          background: '#006C35', color: '#fff',
                          padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                        }}
                      >
                        Phase {p.phaseNumber}
                      </span>
                      <strong>{isAr ? p.nameAr : p.nameEn}</strong>
                      <span style={{ color: '#64748b', fontSize: 12 }}>
                        {new Date(p.startDate).toLocaleDateString()} → {new Date(p.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <ul style={{ paddingInlineStart: 20, marginTop: 6 }}>
                      {p.initiatives.map((i: any) => (
                        <li key={i.id} style={{ fontSize: 13, margin: '4px 0' }}>
                          <strong>{isAr ? i.titleAr : i.titleEn}</strong>{' '}
                          <span style={{ color: '#64748b' }}>
                            · {i.dimensionCode} · SAR {(Number(i.budgetSar) / 1000).toFixed(0)}k · {i.completionPercentage}% complete
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p>No roadmap generated yet.</p>
          )}

          <div style={{ marginTop: 36 }}>
            <div className="eyebrow">Section 4</div>
            <h2 className="display-2">Top AI recommendations</h2>
            <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
              {(recs ?? []).slice(0, 6).map((r: any) => (
                <div
                  key={r.id}
                  style={{
                    border: '1px solid #e5e7eb', borderRadius: 10,
                    padding: 14,
                    borderInlineStart: '4px solid #006C35',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600 }}>{isAr ? r.titleAr : r.titleEn}</div>
                    <div>
                      <Tag>{r.recommendationType}</Tag>
                      <Tag color="blue">{r.dimensionCode}</Tag>
                    </div>
                  </div>
                  <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                    {isAr ? r.descriptionAr : r.descriptionEn}
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 12 }}>
                    <span>Impact: <strong>+{Number(r.estimatedImpactScore).toFixed(2)}</strong></span>
                    <span>Cost: <strong>SAR {(Number(r.estimatedCostSar) / 1000).toFixed(0)}k</strong></span>
                    <span>Confidence: <strong>{Math.round(Number(r.confidenceScore) * 100)}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 50, paddingTop: 20, borderTop: '1px solid #e5e7eb', color: '#94a3b8', fontSize: 11, textAlign: 'center' }}>
            © Veebase LLC · Generated {new Date().toLocaleDateString()} · For internal use
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ flex: 1, padding: 14, background: '#f8fafc', borderRadius: 10 }}>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
    </div>
  );
}
