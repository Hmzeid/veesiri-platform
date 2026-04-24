import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FactoriesService } from '../factories/factories.service';

const toNum = (d: Prisma.Decimal | null | undefined) => (d === null || d === undefined ? 0 : Number(d.toString()));

type Event = {
  at: string;
  type: string;
  actor: string;
  details: string;
  category: 'assessment' | 'gap' | 'roadmap' | 'milestone' | 'certificate' | 'recommendation' | 'notification' | 'document' | 'team';
  severity: 'info' | 'success' | 'warning' | 'critical';
};

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService, private factories: FactoriesService) {}

  async forFactory(userId: string, factoryId: string): Promise<Event[]> {
    await this.factories.assertMember(userId, factoryId);

    const [assessments, gaps, roadmaps, milestones, certs, recs, notifs, docs, team] = await Promise.all([
      this.prisma.assessment.findMany({
        where: { factoryId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      this.prisma.gapAnalysis.findMany({
        where: { factoryId },
        orderBy: { generatedAt: 'desc' },
        take: 10,
      }),
      this.prisma.roadmap.findMany({
        where: { factoryId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.milestone.findMany({
        where: { initiative: { phase: { roadmap: { factoryId } } } },
        orderBy: { completedAt: 'desc' },
        include: { initiative: true },
        take: 30,
      }),
      this.prisma.certificate.findMany({
        where: { factoryId },
        orderBy: { issuedDate: 'desc' },
        take: 10,
      }),
      this.prisma.recommendation.findMany({
        where: { factoryId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.notification.findMany({
        where: { factoryId },
        orderBy: { sentAt: 'desc' },
        take: 20,
      }),
      this.prisma.document.findMany({
        where: { factoryId, isDeleted: false },
        orderBy: { uploadedAt: 'desc' },
        take: 20,
      }),
      this.prisma.factoryUser.findMany({
        where: { factoryId },
        include: { user: { select: { email: true, nameEn: true } } },
        orderBy: { invitedAt: 'desc' },
        take: 20,
      }),
    ]);

    const events: Event[] = [];

    for (const a of assessments) {
      if (a.startedAt) events.push({
        at: a.startedAt.toISOString(), type: 'assessment.started', actor: 'Factory team',
        details: `v${a.version} started`, category: 'assessment', severity: 'info',
      });
      if (a.submittedAt) events.push({
        at: a.submittedAt.toISOString(), type: 'assessment.submitted', actor: 'Factory team',
        details: `v${a.version} submitted — SIRI ${toNum(a.overallScore).toFixed(2)}`,
        category: 'assessment', severity: 'success',
      });
      if (a.certifiedAt) events.push({
        at: a.certifiedAt.toISOString(), type: 'assessment.certified', actor: 'System',
        details: `v${a.version} certified at Level ${toNum(a.overallScore).toFixed(2)}`,
        category: 'assessment', severity: 'success',
      });
    }
    for (const g of gaps) {
      events.push({
        at: g.generatedAt.toISOString(), type: 'gap.generated', actor: 'System',
        details: `Gap analysis generated — overall gap ${toNum(g.overallGap).toFixed(2)}`,
        category: 'gap', severity: 'info',
      });
    }
    for (const r of roadmaps) {
      events.push({
        at: r.createdAt.toISOString(), type: 'roadmap.created', actor: 'Factory team',
        details: 'Transformation roadmap created', category: 'roadmap', severity: 'info',
      });
      if (r.approvedAt) events.push({
        at: r.approvedAt.toISOString(), type: 'roadmap.approved', actor: 'Factory admin',
        details: `Roadmap approved (SAR ${(toNum(r.totalBudgetSar) / 1_000_000).toFixed(2)}M)`,
        category: 'roadmap', severity: 'success',
      });
    }
    for (const m of milestones) {
      if (m.completedAt) events.push({
        at: m.completedAt.toISOString(), type: 'milestone.completed', actor: 'Initiative owner',
        details: m.titleEn, category: 'milestone', severity: 'success',
      });
    }
    for (const c of certs) {
      events.push({
        at: c.issuedDate.toISOString(), type: 'certificate.issued', actor: 'System',
        details: `Certificate ${c.verificationCode} — Level ${toNum(c.siriLevelAchieved).toFixed(2)}`,
        category: 'certificate', severity: 'success',
      });
    }
    for (const r of recs) {
      events.push({
        at: r.createdAt.toISOString(), type: 'recommendation.generated', actor: 'AI engine',
        details: r.titleEn, category: 'recommendation', severity: 'info',
      });
    }
    for (const n of notifs) {
      events.push({
        at: n.sentAt.toISOString(), type: `notification.${n.type.toLowerCase()}`,
        actor: 'System',
        details: n.titleEn,
        category: 'notification',
        severity: n.priority === 'CRITICAL' ? 'critical' : n.priority === 'HIGH' ? 'warning' : 'info',
      });
    }
    for (const d of docs) {
      events.push({
        at: d.uploadedAt.toISOString(), type: 'document.uploaded', actor: 'Factory team',
        details: `${d.nameEn} (${d.documentType})`, category: 'document', severity: 'info',
      });
    }
    for (const t of team) {
      if (t.acceptedAt) events.push({
        at: t.acceptedAt.toISOString(), type: 'team.joined', actor: t.user.nameEn ?? t.user.email,
        details: `Joined as ${t.role}`, category: 'team', severity: 'info',
      });
      else events.push({
        at: t.invitedAt.toISOString(), type: 'team.invited', actor: 'Admin',
        details: `${t.user.email} invited as ${t.role}`, category: 'team', severity: 'info',
      });
    }

    return events
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 200);
  }

  async forecast(userId: string, factoryId: string) {
    await this.factories.assertMember(userId, factoryId);

    const factory = await this.prisma.factory.findUnique({
      where: { id: factoryId },
      include: {
        assessments: {
          where: { status: { in: ['SUBMITTED', 'CERTIFIED'] } },
          orderBy: { submittedAt: 'desc' },
          take: 1,
        },
        roadmaps: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            phases: {
              include: {
                initiatives: { include: { milestones: true } },
              },
            },
          },
        },
        gapAnalyses: {
          orderBy: { generatedAt: 'desc' },
          take: 1,
        },
      },
    });
    if (!factory) return null;

    const latest = factory.assessments[0];
    const currentScore = latest ? toNum(latest.overallScore) : 0;
    const target = factory.gapAnalyses[0] ? toNum(factory.gapAnalyses[0].targetOverallScore) : 3.5;

    const roadmap = factory.roadmaps[0];
    const allInitiatives = roadmap?.phases.flatMap((p) => p.initiatives) ?? [];
    const allMilestones = allInitiatives.flatMap((i) => i.milestones);
    const completedMilestones = allMilestones.filter((m) => m.status === 'COMPLETED').length;
    const totalMilestones = allMilestones.length;

    // Historical velocity: milestones completed per month since roadmap start
    const roadmapStart = roadmap?.startDate ?? new Date();
    const monthsElapsed = Math.max(1, (Date.now() - new Date(roadmapStart).getTime()) / (30 * 24 * 3600 * 1000));
    const velocityMilestonesPerMonth = completedMilestones / monthsElapsed;

    // Each milestone contributes ~(target - current) / totalMilestones points
    const pointsPerMilestone = totalMilestones > 0 ? (target - currentScore) / totalMilestones : 0.02;
    const monthlyScoreGain = velocityMilestonesPerMonth * pointsPerMilestone;

    const gap = Math.max(0, target - currentScore);
    const monthsToTarget = monthlyScoreGain > 0 ? Math.ceil(gap / monthlyScoreGain) : null;

    // Projection over next 24 months
    const now = new Date();
    const projected: { month: string; withRoadmap: number; withoutRoadmap: number }[] = [];
    for (let i = 0; i <= 24; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const label = d.toLocaleString('en', { month: 'short', year: '2-digit' });
      const withRoadmap = Math.min(5, currentScore + monthlyScoreGain * i);
      const withoutRoadmap = Math.min(5, currentScore + monthlyScoreGain * 0.12 * i); // 12% of velocity without action
      projected.push({ month: label, withRoadmap: Math.round(withRoadmap * 100) / 100, withoutRoadmap: Math.round(withoutRoadmap * 100) / 100 });
    }

    return {
      currentScore,
      targetScore: target,
      gap,
      velocityMilestonesPerMonth: Math.round(velocityMilestonesPerMonth * 100) / 100,
      monthlyScoreGain: Math.round(monthlyScoreGain * 1000) / 1000,
      monthsToTarget,
      completedMilestones,
      totalMilestones,
      projected,
      confidence: Math.min(95, 50 + completedMilestones * 5),
    };
  }

  async sustainability(userId: string, factoryId: string) {
    await this.factories.assertMember(userId, factoryId);

    const assessment = await this.prisma.assessment.findFirst({
      where: { factoryId, status: { in: ['SUBMITTED', 'CERTIFIED'] } },
      orderBy: { submittedAt: 'desc' },
      include: { responses: true },
    });
    if (!assessment) return null;

    // Companion ESG-adjacent scores computed from SIRI dimensions
    const byCode: Record<string, number> = {};
    for (const r of assessment.responses) byCode[r.dimensionCode] = r.rawScore;

    // E (Environmental / digital-efficiency): ops + supply chain digitization + connectivity
    const environmental = Math.round(
      (((byCode['OPS-1'] ?? 0) + (byCode['SC-1'] ?? 0) + (byCode['SC-2'] ?? 0) + (byCode['CONN-1'] ?? 0) + (byCode['INT-1'] ?? 0)) / 5) * 100,
    ) / 100;
    // S (Social / talent & governance transparency)
    const social = Math.round(
      (((byCode['TAL-1'] ?? 0) + (byCode['TAL-2'] ?? 0) + (byCode['STR-1'] ?? 0)) / 3) * 100,
    ) / 100;
    // G (Governance / strategy + automation rigor)
    const governance = Math.round(
      (((byCode['STR-1'] ?? 0) + (byCode['STR-2'] ?? 0) + (byCode['AUTO-1'] ?? 0) + (byCode['AUTO-2'] ?? 0)) / 4) * 100,
    ) / 100;

    const composite = Math.round(((environmental + social + governance) / 3) * 100) / 100;

    // Estimated CO2e reduction potential based on connectivity + intelligence uplift
    const digitalMaturity = (byCode['CONN-1'] ?? 0) + (byCode['INT-1'] ?? 0) + (byCode['INT-2'] ?? 0);
    const estimatedCo2ReductionPct = Math.min(40, Math.round(digitalMaturity * 2.5));
    const estimatedEnergyReductionPct = Math.min(30, Math.round((byCode['OPS-2'] ?? 0) * 3 + (byCode['AUTO-1'] ?? 0) * 2));

    return {
      composite,
      environmental,
      social,
      governance,
      estimatedCo2ReductionPct,
      estimatedEnergyReductionPct,
      peerMedian: Math.max(0, composite - 0.4),
      peerTop25: Math.min(5, composite + 0.6),
      rating: composite >= 4 ? 'AAA' : composite >= 3.5 ? 'AA' : composite >= 3 ? 'A' : composite >= 2.5 ? 'BBB' : composite >= 2 ? 'BB' : 'B',
    };
  }
}
