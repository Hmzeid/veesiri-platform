import { Injectable } from '@nestjs/common';
import { IndustryGroup } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionBankService {
  constructor(private prisma: PrismaService) {}

  async forIndustry(industry: IndustryGroup) {
    const rows = await this.prisma.questionBank.findMany({
      where: {
        isActive: true,
        OR: [{ industryGroup: industry }, { industryGroup: null }],
      },
      orderBy: [{ buildingBlock: 'asc' }, { pillar: 'asc' }, { dimensionCode: 'asc' }],
    });
    const byCode = new Map<string, typeof rows[number]>();
    for (const r of rows) {
      const existing = byCode.get(r.dimensionCode);
      if (!existing || (existing.industryGroup === null && r.industryGroup !== null)) {
        byCode.set(r.dimensionCode, r);
      }
    }
    return Array.from(byCode.values());
  }
}
