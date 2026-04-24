import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MilestoneStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FactoriesService } from '../factories/factories.service';

@Injectable()
export class RoadmapService {
  constructor(private prisma: PrismaService, private factories: FactoriesService) {}

  async latestForFactory(userId: string, factoryId: string) {
    await this.factories.assertMember(userId, factoryId);
    return this.prisma.roadmap.findFirst({
      where: { factoryId },
      orderBy: { createdAt: 'desc' },
      include: {
        phases: {
          orderBy: { phaseNumber: 'asc' },
          include: {
            initiatives: {
              include: { milestones: { orderBy: { dueDate: 'asc' } } },
              orderBy: { startDate: 'asc' },
            },
          },
        },
      },
    });
  }

  async get(userId: string, id: string) {
    const rm = await this.prisma.roadmap.findUnique({
      where: { id },
      include: {
        phases: {
          orderBy: { phaseNumber: 'asc' },
          include: { initiatives: { include: { milestones: true } } },
        },
      },
    });
    if (!rm) throw new NotFoundException('Roadmap not found');
    await this.factories.assertMember(userId, rm.factoryId);
    return rm;
  }

  async completeMilestone(userId: string, milestoneId: string) {
    const ms = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { initiative: { include: { phase: { include: { roadmap: true } } } } },
    });
    if (!ms) throw new NotFoundException('Milestone not found');
    await this.factories.assertMember(userId, ms.initiative.phase.roadmap.factoryId);
    return this.prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: MilestoneStatus.COMPLETED, completedAt: new Date() },
    });
  }

  async approve(userId: string, roadmapId: string) {
    const rm = await this.prisma.roadmap.findUnique({ where: { id: roadmapId } });
    if (!rm) throw new NotFoundException('Roadmap not found');
    await this.factories.assertAdmin(userId, rm.factoryId);
    return this.prisma.roadmap.update({
      where: { id: roadmapId },
      data: { status: 'APPROVED', approvedById: userId, approvedAt: new Date() },
    });
  }

  async updateInitiativeProgress(userId: string, initiativeId: string, percent: number) {
    if (percent < 0 || percent > 100) throw new BadRequestException('percent must be 0-100');
    const ini = await this.prisma.roadmapInitiative.findUnique({
      where: { id: initiativeId },
      include: { phase: { include: { roadmap: true } } },
    });
    if (!ini) throw new NotFoundException('Initiative not found');
    await this.factories.assertMember(userId, ini.phase.roadmap.factoryId);
    return this.prisma.roadmapInitiative.update({
      where: { id: initiativeId },
      data: {
        completionPercentage: percent,
        status: percent >= 100 ? 'COMPLETED' : percent > 0 ? 'IN_PROGRESS' : 'PLANNED',
      },
    });
  }
}
