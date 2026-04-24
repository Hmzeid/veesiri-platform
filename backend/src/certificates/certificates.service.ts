import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FactoriesService } from '../factories/factories.service';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService, private factories: FactoriesService) {}

  async latestForFactory(userId: string, factoryId: string) {
    await this.factories.assertMember(userId, factoryId);
    return this.prisma.certificate.findFirst({
      where: { factoryId, isValid: true },
      orderBy: { issuedDate: 'desc' },
      include: { assessment: true, factory: true },
    });
  }

  async verifyPublic(code: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { verificationCode: code },
      include: {
        factory: {
          select: { nameAr: true, nameEn: true, crNumber: true, region: true, industryGroup: true },
        },
        assessment: { select: { overallScore: true, submittedAt: true } },
      },
    });
    if (!cert) throw new NotFoundException('Certificate not found');
    return {
      valid: cert.isValid && cert.expiryDate > new Date(),
      verificationCode: cert.verificationCode,
      siriLevelAchieved: cert.siriLevelAchieved,
      issuedDate: cert.issuedDate,
      expiryDate: cert.expiryDate,
      factory: cert.factory,
      assessment: cert.assessment,
    };
  }
}
