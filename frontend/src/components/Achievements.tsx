import { Tooltip } from 'antd';

type Badge = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  tint: string;
};

export default function Achievements({
  factory,
  assessmentsCount,
  hasRoadmap,
  recsCount,
  hasCertificate,
  score,
}: {
  factory: any;
  assessmentsCount: number;
  hasRoadmap: boolean;
  recsCount: number;
  hasCertificate: boolean;
  score: number | null;
}) {
  const badges: Badge[] = [
    {
      id: 'onboarded',
      title: 'Onboarded',
      description: 'Completed factory onboarding and profile setup.',
      icon: '🚀',
      unlocked: !!factory?.onboardingCompleted,
      tint: '#006C35',
    },
    {
      id: 'first-assessment',
      title: 'First Assessment',
      description: 'Submitted your first SIRI self-assessment.',
      icon: '📊',
      unlocked: assessmentsCount > 0,
      tint: '#0ea5e9',
    },
    {
      id: 'certified',
      title: 'SIRI Certified',
      description: 'Earned your official SIRI Certificate of Compliance.',
      icon: '🏆',
      unlocked: hasCertificate,
      tint: '#C8A548',
    },
    {
      id: 'roadmap',
      title: 'Roadmap in action',
      description: 'Approved a transformation roadmap.',
      icon: '🗺️',
      unlocked: hasRoadmap,
      tint: '#8b5cf6',
    },
    {
      id: 'score-3',
      title: 'On-track',
      description: 'Achieved SIRI Level 3.0 or higher.',
      icon: '⭐',
      unlocked: (score ?? 0) >= 3,
      tint: '#84cc16',
    },
    {
      id: 'score-4',
      title: 'Industry leader',
      description: 'Achieved SIRI Level 4.0 or higher.',
      icon: '👑',
      unlocked: (score ?? 0) >= 4,
      tint: '#f59e0b',
    },
    {
      id: 'sidf-eligible',
      title: 'SIDF ready',
      description: 'Eligible for SIDF financing programs.',
      icon: '🏦',
      unlocked: !!factory?.sidfEligible,
      tint: '#059669',
    },
    {
      id: 'sidf-financed',
      title: 'SIDF backed',
      description: 'Received SIDF financing.',
      icon: '💎',
      unlocked: !!factory?.sidfFinanced,
      tint: '#7c3aed',
    },
    {
      id: 'ai-enabled',
      title: 'AI-assisted',
      description: 'Received AI recommendations for your gap analysis.',
      icon: '🤖',
      unlocked: recsCount > 0,
      tint: '#06b6d4',
    },
  ];

  const unlocked = badges.filter((b) => b.unlocked).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#64748b', textTransform: 'uppercase' }}>
            Achievements
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>
            {unlocked} / {badges.length} unlocked
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 10 }}>
        {badges.map((b) => (
          <Tooltip
            key={b.id}
            title={
              <div>
                <div style={{ fontWeight: 700 }}>{b.title}</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>{b.description}</div>
                {!b.unlocked && <div style={{ fontSize: 11, marginTop: 6, opacity: 0.8 }}>Locked</div>}
              </div>
            }
          >
            <div
              style={{
                position: 'relative',
                aspectRatio: '1 / 1',
                borderRadius: 14,
                display: 'grid',
                placeItems: 'center',
                fontSize: 28,
                background: b.unlocked
                  ? `linear-gradient(135deg, ${b.tint}22 0%, ${b.tint}08 100%)`
                  : '#f1f5f9',
                border: b.unlocked ? `2px solid ${b.tint}` : '2px dashed #cbd5e1',
                filter: b.unlocked ? 'none' : 'grayscale(1) opacity(0.5)',
                cursor: 'default',
                transition: 'all 0.2s ease',
              }}
            >
              {b.icon}
              {b.unlocked && (
                <div
                  style={{
                    position: 'absolute', bottom: -4, insetInlineEnd: -4,
                    width: 18, height: 18, borderRadius: '50%',
                    background: b.tint, color: '#fff',
                    display: 'grid', placeItems: 'center',
                    fontSize: 11, fontWeight: 800,
                    border: '2px solid #fff',
                  }}
                >
                  ✓
                </div>
              )}
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
