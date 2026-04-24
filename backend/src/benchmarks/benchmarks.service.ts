import { Injectable } from '@nestjs/common';
import { IndustryGroup } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BenchmarksService {
  constructor(private prisma: PrismaService) {}

  forIndustry(industry: IndustryGroup) {
    return this.prisma.benchmarkSnapshot.findMany({
      where: { industryGroup: industry },
      orderBy: { dimensionCode: 'asc' },
    });
  }
}
