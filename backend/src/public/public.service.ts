import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const toNum = (d: Prisma.Decimal | null | undefined) => (d === null || d === undefined ? 0 : Number(d.toString()));

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async landingStats() {
    const totalRegistered = await this.prisma.factory.count();
    const totalAssessed = await this.prisma.factory.count({
      where: { assessments: { some: { status: { in: ['SUBMITTED', 'CERTIFIED'] } } } },
    });
    const assessments = await this.prisma.assessment.findMany({
      where: { status: { in: ['SUBMITTED', 'CERTIFIED'] } },
      select: { overallScore: true },
    });
    const avgScore = assessments.length
      ? assessments.reduce((a, b) => a + toNum(b.overallScore), 0) / assessments.length
      : 0;
    const sidfFinanced = await this.prisma.factory.count({ where: { sidfFinanced: true } });
    const financingTotal = await this.prisma.factory.aggregate({
      where: { sidfFinanced: true },
      _sum: { sidfAmountSar: true },
    });
    const certificatesIssued = await this.prisma.certificate.count({ where: { isValid: true } });

    // Featured "case studies" — top 3 performers
    const featured = await this.prisma.factory.findMany({
      take: 3,
      where: {
        assessments: { some: { status: { in: ['SUBMITTED', 'CERTIFIED'] }, overallScore: { gte: 3.5 } } },
      },
      include: {
        assessments: {
          where: { status: { in: ['SUBMITTED', 'CERTIFIED'] } },
          orderBy: { submittedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { sidfAmountSar: 'desc' },
    });

    return {
      totalRegistered,
      totalAssessed,
      averageNationalSiriScore: Math.round(avgScore * 100) / 100,
      factoriesSidfFinanced: sidfFinanced,
      totalSidfFinancingSar: toNum(financingTotal._sum.sidfAmountSar),
      certificatesIssued,
      vision2030TargetFactories: 4000,
      vision2030ProgressPct: Math.round((totalAssessed / 4000) * 10000) / 100,
      featured: featured.map((f) => ({
        id: f.id,
        nameAr: f.nameAr,
        nameEn: f.nameEn,
        industryGroup: f.industryGroup,
        region: f.region,
        city: f.city,
        score: f.assessments[0] ? toNum(f.assessments[0].overallScore) : 0,
        sidfFinanced: f.sidfFinanced,
        sidfAmountSar: toNum(f.sidfAmountSar),
      })),
    };
  }

  async publicMap() {
    // Only show anonymized position + score bands
    const factories = await this.prisma.factory.findMany({
      select: {
        id: true, industryGroup: true, region: true, gpsLat: true, gpsLng: true,
        assessments: {
          where: { status: { in: ['SUBMITTED', 'CERTIFIED'] } },
          orderBy: { submittedAt: 'desc' },
          take: 1,
          select: { overallScore: true },
        },
      },
    });
    return factories.map((f) => ({
      id: f.id,
      industryGroup: f.industryGroup,
      region: f.region,
      lat: toNum(f.gpsLat),
      lng: toNum(f.gpsLng),
      overallScore: f.assessments[0] ? toNum(f.assessments[0].overallScore) : null,
    }));
  }
}
