import { useMemo, useState } from 'react';
import { Card, Col, Row, Typography, Space, Checkbox, InputNumber, Slider, Tag, Empty, Statistic } from 'antd';
import { RiseOutlined, DollarCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import ReactECharts from 'echarts-for-react';
import { api } from '../api/client';

export default function RoiCalculatorPage() {
  const { factoryId } = useParams();
  const { i18n } = useTranslation();

  const { data: gap } = useQuery<any>({
    queryKey: ['gap-latest', factoryId],
    queryFn: async () => (await api.get(`/gap-analysis/latest?factoryId=${factoryId}`)).data,
  });
  const { data: factory } = useQuery<any>({
    queryKey: ['factory', factoryId],
    queryFn: async () => (await api.get(`/factories/${factoryId}`)).data,
  });

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [savingsMultiplier, setSavingsMultiplier] = useState(1.0);
  const [revenue, setRevenue] = useState<number>(Number(factory?.annualRevenueSar ?? 100_000_000));

  const gaps: any[] = gap?.dimensionGaps ?? [];

  const { totalCost, totalRoi, scoreLift, breakEvenMonths, byYear } = useMemo(() => {
    let cost = 0, roi = 0, lift = 0;
    for (const g of gaps) {
      if (!selected.has(g.dimensionCode)) continue;
      cost += Number(g.estimatedCostSar);
      roi += Number(g.estimatedRoiSar) * savingsMultiplier;
      lift += Number(g.gapMagnitude);
    }
    // Additional revenue uplift based on score lift: each +1 SIRI ≈ +2% revenue uplift annually
    const revUplift = (lift / gaps.length) * revenue * 0.02;
    const totalAnnualRoi = roi + revUplift;
    const monthsToBreakeven = totalAnnualRoi > 0 ? Math.round((cost / (totalAnnualRoi / 12)) * 10) / 10 : 0;
    // 3-year projection
    const years = [];
    for (let y = 1; y <= 3; y++) {
      const cumulativeRoi = totalAnnualRoi * y * (0.7 + y * 0.1);
      years.push({ year: `Y${y}`, cost: y === 1 ? cost : 0, cumulativeRoi, net: cumulativeRoi - cost });
    }
    return { totalCost: cost, totalRoi: totalAnnualRoi, scoreLift: gaps.length ? lift / gaps.length : 0, breakEvenMonths: monthsToBreakeven, byYear: years };
  }, [selected, gaps, savingsMultiplier, revenue]);

  if (!gap) return <Card><Empty description="No gap analysis available" /></Card>;

  const barOption = {
    grid: { left: 80, right: 30, top: 20, bottom: 30 },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, data: ['Cost', 'Cumulative ROI', 'Net'] },
    xAxis: { type: 'category', data: byYear.map((y) => y.year) },
    yAxis: { type: 'value', name: 'SAR' },
    series: [
      { type: 'bar', name: 'Cost', data: byYear.map((y) => y.cost), itemStyle: { color: '#f97316' } },
      { type: 'bar', name: 'Cumulative ROI', data: byYear.map((y) => Math.round(y.cumulativeRoi)), itemStyle: { color: '#006C35' } },
      { type: 'line', name: 'Net', data: byYear.map((y) => Math.round(y.net)), smooth: true, itemStyle: { color: '#C8A548' }, lineStyle: { width: 3 } },
    ],
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <DollarCircleOutlined style={{ fontSize: 26, color: '#C8A548' }} />
              <div>
                <Typography.Title level={3} style={{ margin: 0 }}>ROI Calculator</Typography.Title>
                <Typography.Text type="secondary">
                  Select gaps to close and see projected savings + break-even.
                </Typography.Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Typography.Text>Annual revenue (SAR)</Typography.Text>
              <InputNumber
                value={revenue}
                onChange={(v) => setRevenue(Number(v) || 0)}
                style={{ width: 180 }}
                formatter={(v) => `${Number(v).toLocaleString()}`}
                parser={(v: any) => Number((v ?? '').toString().replace(/[^\d]/g, ''))}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col xs={24} md={16}>
          <Card title="Select initiatives to close">
            {gaps.slice(0, 10).map((g) => {
              const sel = selected.has(g.dimensionCode);
              return (
                <div
                  key={g.id}
                  onClick={() => setSelected((s) => {
                    const ns = new Set(s);
                    if (ns.has(g.dimensionCode)) ns.delete(g.dimensionCode);
                    else ns.add(g.dimensionCode);
                    return ns;
                  })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: sel ? '#e6f3ec' : '#fafafa',
                    border: sel ? '1px solid #006C35' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    marginBottom: 10,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Checkbox checked={sel} onChange={() => {}} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>
                      <Tag>{g.dimensionCode}</Tag>
                      {i18n.language === 'ar' ? g.narrativeAr : g.narrativeEn}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                      Current {Number(g.currentScore).toFixed(2)} → Target {Number(g.targetScore).toFixed(2)}
                      {' · '}
                      Gap {Number(g.gapMagnitude).toFixed(2)}
                      {' · '}
                      {g.estimatedEffortMonths}mo effort
                    </div>
                  </div>
                  <div style={{ textAlign: 'end' }}>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Cost</div>
                    <div style={{ fontWeight: 700 }}>SAR {(Number(g.estimatedCostSar) / 1000).toFixed(0)}k</div>
                  </div>
                  <div style={{ textAlign: 'end' }}>
                    <div style={{ fontSize: 12, color: '#64748b' }}>ROI / yr</div>
                    <div style={{ fontWeight: 700, color: '#006C35' }}>
                      SAR {(Number(g.estimatedRoiSar) / 1000).toFixed(0)}k
                    </div>
                  </div>
                  {g.isSidfRelevant && <Tag color="purple">SIDF</Tag>}
                </div>
              );
            })}
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Projection">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 11, letterSpacing: '0.1em' }}>
                  TOTAL INVESTMENT
                </Typography.Text>
                <div style={{ fontSize: 28, fontWeight: 700 }}>
                  SAR {totalCost.toLocaleString()}
                </div>
              </div>
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 11, letterSpacing: '0.1em' }}>
                  ESTIMATED ANNUAL ROI
                </Typography.Text>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#006C35' }}>
                  <RiseOutlined /> SAR {Math.round(totalRoi).toLocaleString()}
                </div>
              </div>
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 11, letterSpacing: '0.1em' }}>
                  AVG SCORE LIFT PER DIMENSION
                </Typography.Text>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#C8A548' }}>
                  +{scoreLift.toFixed(2)} pts
                </div>
              </div>
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 11, letterSpacing: '0.1em' }}>
                  BREAK-EVEN
                </Typography.Text>
                <div style={{ fontSize: 28, fontWeight: 700 }}>
                  <ClockCircleOutlined /> {breakEvenMonths > 0 ? `${breakEvenMonths} mo` : '—'}
                </div>
              </div>
              <div>
                <Typography.Text type="secondary">Assumed savings multiplier</Typography.Text>
                <Slider
                  min={0.5} max={2.0} step={0.1}
                  value={savingsMultiplier}
                  onChange={(v) => setSavingsMultiplier(v as number)}
                  marks={{ 0.5: '0.5x', 1.0: '1x', 1.5: '1.5x', 2.0: '2x' }}
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="3-year projection">
        <ReactECharts option={barOption} style={{ height: 320 }} />
      </Card>
    </Space>
  );
}
