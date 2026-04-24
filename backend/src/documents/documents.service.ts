import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FactoriesService } from '../factories/factories.service';

export type CreateDocumentInput = {
  folderId?: string;
  nameEn: string;
  nameAr?: string;
  fileUrl: string;
  fileType: string;
  fileSizeBytes?: number;
  documentType?: DocumentType;
  dimensionTags?: string[];
  expiryDate?: string;
};

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService, private factories: FactoriesService) {}

  async folders(userId: string, factoryId: string) {
    await this.factories.assertMember(userId, factoryId);
    return this.prisma.documentFolder.findMany({
      where: { factoryId },
      orderBy: { nameEn: 'asc' },
    });
  }

  async list(userId: string, factoryId: string, folderId?: string) {
    await this.factories.assertMember(userId, factoryId);
    return this.prisma.document.findMany({
      where: { factoryId, isDeleted: false, ...(folderId ? { folderId } : {}) },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async create(userId: string, factoryId: string, dto: CreateDocumentInput) {
    await this.factories.assertMember(userId, factoryId);
    return this.prisma.document.create({
      data: {
        factoryId,
        folderId: dto.folderId,
        nameEn: dto.nameEn,
        nameAr: dto.nameAr,
        fileUrl: dto.fileUrl,
        fileType: dto.fileType,
        fileSizeBytes: dto.fileSizeBytes ?? 0,
        documentType: dto.documentType ?? 'OTHER',
        dimensionTags: dto.dimensionTags ?? [],
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        uploadedById: userId,
      },
    });
  }

  async softDelete(userId: string, id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException();
    await this.factories.assertMember(userId, doc.factoryId);
    return this.prisma.document.update({ where: { id }, data: { isDeleted: true } });
  }

  async expiring(userId: string, factoryId: string, days: number) {
    await this.factories.assertMember(userId, factoryId);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + days);
    return this.prisma.document.findMany({
      where: {
        factoryId,
        isDeleted: false,
        expiryDate: { not: null, lte: threshold },
      },
      orderBy: { expiryDate: 'asc' },
    });
  }
}
