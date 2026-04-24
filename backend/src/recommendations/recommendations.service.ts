import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FactoriesService } from '../factories/factories.service';

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService, private factories: FactoriesService) {}

  async listForFactory(userId: string, factoryId: string) {
    await this.factories.assertMember(userId, factoryId);
    return this.prisma.recommendation.findMany({
      where: { factoryId },
      orderBy: [{ estimatedImpactScore: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async feedback(userId: string, id: string, value: 'helpful' | 'not_helpful') {
    const r = await this.prisma.recommendation.findUnique({ where: { id } });
    if (!r) throw new NotFoundException();
    await this.factories.assertMember(userId, r.factoryId);
    return this.prisma.recommendation.update({
      where: { id },
      data: { userFeedback: value },
    });
  }
}
