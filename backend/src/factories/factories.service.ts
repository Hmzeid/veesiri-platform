import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FactoryRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFactoryDto, UpdateFactoryDto } from './factories.dto';

@Injectable()
export class FactoriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateFactoryDto) {
    if (!/^\d{10}$/.test(dto.crNumber)) {
      throw new ConflictException('CR number must be 10 digits');
    }
    const existing = await this.prisma.factory.findUnique({ where: { crNumber: dto.crNumber } });
    if (existing) throw new ConflictException('CR number already registered');

    const sidfEligible = this.runSidfPrecheck(dto);

    const factory = await this.prisma.factory.create({
      data: {
        ...dto,
        ownerId: userId,
        sidfEligible,
        onboardingStep: 2,
        users: { create: { userId, role: FactoryRole.ADMIN, acceptedAt: new Date() } },
      },
      include: { users: true },
    });
    return factory;
  }

  async list(userId: string) {
    return this.prisma.factory.findMany({
      where: { users: { some: { userId } } },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { assessments: true, certifications: true } },
      },
    });
  }

  async get(userId: string, id: string) {
    await this.assertMember(userId, id);
    return this.prisma.factory.findUnique({
      where: { id },
      include: {
        certifications: true,
        users: { include: { user: { select: { id: true, email: true, nameEn: true, nameAr: true } } } },
        assessments: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateFactoryDto) {
    await this.assertAdmin(userId, id);
    const completed = dto.onboardingStep !== undefined && dto.onboardingStep >= 6;
    return this.prisma.factory.update({
      where: { id },
      data: {
        ...dto,
        onboardingCompleted: completed || undefined,
        status: completed ? 'ACTIVE' : undefined,
      },
    });
  }

  async listTeam(userId: string, factoryId: string) {
    await this.assertMember(userId, factoryId);
    return this.prisma.factoryUser.findMany({
      where: { factoryId },
      include: { user: { select: { id: true, email: true, nameEn: true, nameAr: true } } },
      orderBy: { invitedAt: 'asc' },
    });
  }

  async inviteMember(userId: string, factoryId: string, email: string, role: FactoryRole) {
    await this.assertAdmin(userId, factoryId);
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // placeholder — in real life we'd email an invite; for demo, create a stub user
      user = await this.prisma.user.create({
        data: {
          email,
          passwordHash: 'PENDING_INVITE',
          nameEn: email.split('@')[0],
        },
      });
    }
    return this.prisma.factoryUser.upsert({
      where: { factoryId_userId: { factoryId, userId: user.id } },
      create: { factoryId, userId: user.id, role, acceptedAt: new Date() },
      update: { role },
      include: { user: { select: { id: true, email: true, nameEn: true, nameAr: true } } },
    });
  }

  async removeMember(userId: string, factoryId: string, targetUserId: string) {
    await this.assertAdmin(userId, factoryId);
    if (userId === targetUserId) {
      throw new ConflictException('Cannot remove yourself');
    }
    return this.prisma.factoryUser.deleteMany({ where: { factoryId, userId: targetUserId } });
  }

  async updateMemberRole(userId: string, factoryId: string, targetUserId: string, role: FactoryRole) {
    await this.assertAdmin(userId, factoryId);
    return this.prisma.factoryUser.updateMany({
      where: { factoryId, userId: targetUserId },
      data: { role },
    });
  }

  async assertMember(userId: string, factoryId: string) {
    const link = await this.prisma.factoryUser.findFirst({ where: { factoryId, userId } });
    if (!link) throw new ForbiddenException('Not a member of this factory');
    return link;
  }

  async assertAdmin(userId: string, factoryId: string) {
    const link = await this.assertMember(userId, factoryId);
    if (link.role !== FactoryRole.ADMIN) throw new ForbiddenException('Admin role required');
    return link;
  }

  private runSidfPrecheck(dto: CreateFactoryDto) {
    return dto.employeeCount >= 10 && dto.sizeClassification !== 'MICRO';
  }
}
