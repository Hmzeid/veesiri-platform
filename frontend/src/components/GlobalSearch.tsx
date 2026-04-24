import { useState, useEffect, useMemo, useRef } from 'react';
import { Modal, Input, Tag, Empty } from 'antd';
import {
  SearchOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
  DollarCircleOutlined,
  NodeIndexOutlined,
  AppstoreAddOutlined,
  CalendarOutlined,
  BulbOutlined,
  FolderOpenOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ShopOutlined,
  ApiOutlined,
  BookOutlined,
  SettingOutlined,
  PlusCircleOutlined,
  BellOutlined,
  FileDoneOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useSelectedFactory } from '../store/selectedFactory';
import { api } from '../api/client';

type Item = {
  id: string;
  label: string;
  sub?: string;
  icon: React.ReactNode;
  path: string;
  group: string;
  keywords?: string;
};

export default function GlobalSearch({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const selected = useSelectedFactory((s) => s.factoryId);
  const setFactoryId = useSelectedFactory((s) => s.setFactoryId);
  const [q, setQ] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<any>(null);

  const { data: factories } = useQuery<any[]>({
    queryKey: ['factories'],
    queryFn: async () => (await api.get('/factories')).data,
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      setQ('');
      setIndex(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  const pages: Item[] = useMemo(() => {
    const fid = selected;
    const pageItems: Item[] = [
      { id: 'p-dash', label: t('nav.dashboard'), icon: <DashboardOutlined />, path: '/app/dashboard', group: 'Pages', keywords: 'home overview' },
      { id: 'p-fact', label: t('nav.factories'), icon: <AppstoreOutlined />, path: '/app/factories', group: 'Pages', keywords: 'all factories list' },
      { id: 'p-onb', label: t('nav.onboarding'), icon: <PlusCircleOutlined />, path: '/app/onboarding', group: 'Pages', keywords: 'register new factory' },
      { id: 'p-notif', label: t('notifications.title'), icon: <BellOutlined />, path: '/app/notifications', group: 'Pages' },
      { id: 'p-train', label: 'Training Hub', icon: <BookOutlined />, path: '/app/training', group: 'Pages', keywords: 'courses learning certification' },
      { id: 'p-vend', label: 'Vendor Marketplace', icon: <ShopOutlined />, path: '/app/vendors', group: 'Pages', keywords: 'partners solutions' },
      { id: 'p-int', label: 'Integrations', icon: <ApiOutlined />, path: '/app/integrations', group: 'Pages', keywords: 'sap oracle sidf' },
      { id: 'p-audit', label: 'Audit Log', icon: <AuditOutlined />, path: '/app/audit-log', group: 'Pages', keywords: 'history compliance pdpl' },
      { id: 'p-set', label: 'Settings', icon: <SettingOutlined />, path: '/app/settings', group: 'Pages' },
    ];
    if (fid) {
      pageItems.push(
        { id: 'f-gap', label: t('nav.gapAnalysis'), icon: <BarChartOutlined />, path: `/app/factories/${fid}/gap-analysis`, group: 'Factory' },
        { id: 'f-sim', label: 'What-if Simulator', icon: <ThunderboltOutlined />, path: `/app/factories/${fid}/simulator`, group: 'Factory', keywords: 'simulate scenario' },
        { id: 'f-roi', label: 'ROI Calculator', icon: <DollarCircleOutlined />, path: `/app/factories/${fid}/roi`, group: 'Factory', keywords: 'return investment savings' },
        { id: 'f-rm', label: t('nav.roadmap'), icon: <NodeIndexOutlined />, path: `/app/factories/${fid}/roadmap`, group: 'Factory', keywords: 'phases initiatives' },
        { id: 'f-kb', label: 'Kanban', icon: <AppstoreAddOutlined />, path: `/app/factories/${fid}/kanban`, group: 'Factory', keywords: 'board cards drag' },
        { id: 'f-cal', label: 'Calendar', icon: <CalendarOutlined />, path: `/app/factories/${fid}/calendar`, group: 'Factory', keywords: 'milestones month' },
        { id: 'f-rec', label: t('nav.recommendations'), icon: <BulbOutlined />, path: `/app/factories/${fid}/recommendations`, group: 'Factory', keywords: 'ai suggestions' },
        { id: 'f-doc', label: t('nav.documents'), icon: <FolderOpenOutlined />, path: `/app/factories/${fid}/documents`, group: 'Factory' },
        { id: 'f-bm', label: t('nav.benchmarks'), icon: <RocketOutlined />, path: `/app/factories/${fid}/benchmarks`, group: 'Factory', keywords: 'peer percentile industry' },
        { id: 'f-cert', label: t('nav.certificate'), icon: <SafetyCertificateOutlined />, path: `/app/factories/${fid}/certificate`, group: 'Factory' },
        { id: 'f-tm', label: 'Team', icon: <TeamOutlined />, path: `/app/factories/${fid}/team`, group: 'Factory', keywords: 'members invite' },
        { id: 'f-rep', label: 'Executive Report', icon: <FileDoneOutlined />, path: `/app/factories/${fid}/report`, group: 'Factory', keywords: 'print pdf' },
      );
    }
    return pageItems;
  }, [selected, t]);

  const factoryItems: Item[] = useMemo(() => {
    return (factories ?? []).map((f: any) => ({
      id: 'fac-' + f.id,
      label: i18n.language === 'ar' ? f.nameAr : f.nameEn,
      sub: `${t(`industry.${f.industryGroup}`)} · ${f.region ?? ''} · CR ${f.crNumber}`,
      icon: <AppstoreOutlined />,
      path: '__select_factory__' + f.id,
      group: 'Factories',
      keywords: `${f.crNumber} ${f.region} ${f.city} ${f.industryGroup}`,
    }));
  }, [factories, i18n.language, t]);

  const allItems = [...pages, ...factoryItems];

  const results = useMemo(() => {
    if (!q.trim()) return allItems.slice(0, 20);
    const needle = q.toLowerCase().trim();
    return allItems
      .filter((i) => {
        const haystack = `${i.label} ${i.sub ?? ''} ${i.keywords ?? ''} ${i.group}`.toLowerCase();
        return haystack.includes(needle);
      })
      .slice(0, 30);
  }, [q, allItems]);

  const grouped = useMemo(() => {
    const m = new Map<string, Item[]>();
    for (const r of results) {
      if (!m.has(r.group)) m.set(r.group, []);
      m.get(r.group)!.push(r);
    }
    return Array.from(m.entries());
  }, [results]);

  useEffect(() => {
    if (index >= results.length) setIndex(0);
  }, [results, index]);

  const pick = (it: Item) => {
    if (it.path.startsWith('__select_factory__')) {
      const id = it.path.replace('__select_factory__', '');
      setFactoryId(id);
      nav('/app/dashboard');
    } else {
      nav(it.path);
    }
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIndex((i) => Math.min(results.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIndex((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Enter' && results[index]) { e.preventDefault(); pick(results[index]); }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      maskClosable
      width={640}
      styles={{ body: { padding: 0 } }}
      centered
    >
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #e5e7eb' }}>
        <Input
          ref={inputRef}
          size="large"
          bordered={false}
          prefix={<SearchOutlined style={{ color: '#94a3b8', fontSize: 18 }} />}
          placeholder="Search factories, pages, commands..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          style={{ fontSize: 16 }}
        />
      </div>
      <div style={{ maxHeight: 440, overflowY: 'auto', padding: '6px 0' }}>
        {results.length === 0 ? (
          <Empty description="No matches" style={{ padding: 40 }} />
        ) : (
          grouped.map(([group, items]) => (
            <div key={group} style={{ padding: '4px 0' }}>
              <div style={{ padding: '8px 18px 4px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>
                {group}
              </div>
              {items.map((it) => {
                const globalIdx = results.indexOf(it);
                const active = globalIdx === index;
                return (
                  <div
                    key={it.id}
                    onClick={() => pick(it)}
                    onMouseEnter={() => setIndex(globalIdx)}
                    style={{
                      padding: '10px 18px',
                      display: 'flex', alignItems: 'center', gap: 12,
                      cursor: 'pointer',
                      background: active ? 'var(--color-primary-50)' : 'transparent',
                      borderInlineStart: active ? '3px solid var(--color-primary)' : '3px solid transparent',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: active ? 'var(--color-primary)' : '#f1f5f9',
                      color: active ? '#fff' : '#64748b',
                      display: 'grid', placeItems: 'center', flexShrink: 0,
                    }}>
                      {it.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: '#0b1220' }}>{it.label}</div>
                      {it.sub && (
                        <div style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {it.sub}
                        </div>
                      )}
                    </div>
                    {active && <Tag color="green" style={{ margin: 0 }}>↵</Tag>}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
      <div style={{ padding: '10px 18px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b' }}>
        <span>
          <kbd style={kbd}>↑↓</kbd> navigate &nbsp;
          <kbd style={kbd}>↵</kbd> select &nbsp;
          <kbd style={kbd}>esc</kbd> close
        </span>
        <span>
          <kbd style={kbd}>⌘K</kbd> to reopen
        </span>
      </div>
    </Modal>
  );
}

const kbd: React.CSSProperties = {
  background: '#f1f5f9',
  border: '1px solid #e2e8f0',
  borderRadius: 4,
  padding: '1px 6px',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 10,
  color: '#1a2f4e',
};
