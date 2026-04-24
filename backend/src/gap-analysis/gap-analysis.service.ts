import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AssessmentStatus, GapSeverity, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FactoriesService } from '../factories/factories.service';

const SIDF_RELEVANT_DIMENSIONS = new Set([
  'CONN-1',
  'CONN-2',
  'INT-1',
  'AUTO-1',
  'AUTO-2',
  'OPS-1',
  'SC-1',
]);

const toNum = (d: Prisma.Decimal | string | null | undefined) =>
  d === null || d === undefined ? 0 : Number(d.toString());

@Injectable()
export class GapAnalysisService {
  constructor(private prisma: PrismaService, private factories: FactoriesService) {}

  async generate(userId: string, assessmentId: string, targetScore = 3.5, targetDate?: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { responses: true },
    });
    if (!assessment) throw new NotFoundException('Assessment not found');
    if (assessment.status !== AssessmentStatus.SUBMITTED && assessment.status !== AssessmentStatus.CERTIFIED) {
      throw new BadRequestException('Assessment must be submitted before gap analysis');
    }
    await this.factories.assertMember(userId, assessment.factoryId);

    const overall = toNum(assessment.overallScore);
    const processS = toNum(assessment.processScore);
    const technology = toNum(assessment.technologyScore);
    const organization = toNum(assessment.organizationScore);

    const gapRows = assessment.responses
      .map((r) => {
        const gap = Math.max(0, targetScore - r.rawScore);
        return {
          dimensionCode: r.dimensionCode,
          currentScore: r.rawScore,
          targetScore,
          gapMagnitude: gap,
          severity: this.classify(r.rawScore),
          estimatedEffortMonths: gap <= 1 ? 3 : gap <= 2 ? 9 : 18,
          estimatedCostSar: Math.round(gap * 150000),
          isQuickWin: gap > 0 && gap <= 1.0 && r.rawScore >= 2,
          isSidfRelevant: SIDF_RELEVANT_DIMENSIONS.has(r.dimensionCode),
          narrativeEn: this.narrative(r.dimensionCode, r.rawScore, targetScore, 'en'),
          narrativeAr: this.narrative(r.dimensionCode, r.rawScore, targetScore, 'ar'),
        };
      })
      .sort((a, b) => b.gapMagnitude - a.gapMagnitude)
      .map((g, i) => ({ ...g, priorityRank: i + 1 }));

    return this.prisma.gapAnalysis.create({
      data: {
        factoryId: assessment.factoryId,
        assessmentId: assessment.id,
        overallGap: Math.max(0, targetScore - overall),
        processGap: Math.max(0, targetScore - processS),
        technologyGap: Math.max(0, targetScore - technology),
        organizationGap: Math.max(0, targetScore - organization),
        targetOverallScore: targetScore,
        targetAchievementDate: targetDate ? new Date(targetDate) : null,
        dimensionGaps: { create: gapRows },
      },
      include: { dimensionGaps: { orderBy: { priorityRank: 'asc' } } },
    });
  }

  async get(userId: string, id: string) {
    const gap = await this.prisma.gapAnalysis.findUnique({
      where: { id },
      include: {
        dimensionGaps: { orderBy: { priorityRank: 'asc' } },
        assessment: true,
      },
    });
    if (!gap) throw new NotFoundException('Gap analysis not found');
    await this.factories.assertMember(userId, gap.factoryId);
    return gap;
  }

  async listByFactory(userId: string, factoryId: string) {
    await this.factories.assertMember(userId, factoryId);
    return this.prisma.gapAnalysis.findMany({
      where: { factoryId },
      orderBy: { generatedAt: 'desc' },
      include: { dimensionGaps: true },
    });
  }

  async latestForFactory(userId: string, factoryId: string) {
    await this.factories.assertMember(userId, factoryId);
    return this.prisma.gapAnalysis.findFirst({
      where: { factoryId },
      orderBy: { generatedAt: 'desc' },
      include: { dimensionGaps: { orderBy: { priorityRank: 'asc' } }, assessment: true },
    });
  }

  private classify(score: number): GapSeverity {
    if (score <= 1) return GapSeverity.CRITICAL;
    if (score <= 2) return GapSeverity.MODERATE;
    if (score <= 3) return GapSeverity.MINOR;
    return GapSeverity.ON_TRACK;
  }

  private narrative(code: string, current: number, target: number, lang: 'en' | 'ar') {
    const gap = Math.max(0, target - current);
    if (lang === 'ar') {
      if (gap === 0) return `الأداء في ${code} يلبي الهدف أو يتجاوزه.`;
      if (gap <= 1) return `فجوة صغيرة في ${code} — تحسينات سريعة ممكنة.`;
      if (gap <= 2) return `فجوة متوسطة في ${code} — تتطلب استثمارًا مخططًا.`;
      return `فجوة حرجة في ${code} — يوصى بمبادرة تحول شاملة.`;
    }
    if (gap === 0) return `${code} meets or exceeds the target maturity level.`;
    if (gap <= 1) return `Small gap at ${code} — quick-win improvements are feasible.`;
    if (gap <= 2) return `Moderate gap at ${code} — requires a planned investment.`;
    return `Critical gap at ${code} — a full transformation initiative is recommended.`;
  }
}
