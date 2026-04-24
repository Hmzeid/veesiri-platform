import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AssessmentStatus, BuildingBlock, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FactoriesService } from '../factories/factories.service';
import { QuestionBankService } from '../question-bank/question-bank.service';
import { SaveResponseDto } from './assessments.dto';

const toNum = (d: Prisma.Decimal | null | undefined) => (d ? Number(d.toString()) : 0);

@Injectable()
export class AssessmentsService {
  constructor(
    private prisma: PrismaService,
    private factories: FactoriesService,
    private questionBank: QuestionBankService,
  ) {}

  async start(userId: string, factoryId: string) {
    await this.factories.assertMember(userId, factoryId);
    const factory = await this.prisma.factory.findUnique({ where: { id: factoryId } });
    if (!factory) throw new NotFoundException('Factory not found');

    const existing = await this.prisma.assessment.findFirst({
      where: {
        factoryId,
        status: { in: [AssessmentStatus.DRAFT, AssessmentStatus.IN_PROGRESS] },
      },
    });
    if (existing) return existing;

    const lastVersion = await this.prisma.assessment.count({ where: { factoryId } });
    return this.prisma.assessment.create({
      data: {
        factoryId,
        industryGroup: factory.industryGroup,
        status: AssessmentStatus.IN_PROGRESS,
        version: lastVersion + 1,
      },
    });
  }

  async get(userId: string, id: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
      include: { responses: true, factory: true },
    });
    if (!assessment) throw new NotFoundException('Assessment not found');
    await this.factories.assertMember(userId, assessment.factoryId);
    const questions = await this.questionBank.forIndustry(assessment.industryGroup);
    return { ...assessment, questions };
  }

  async saveResponse(userId: string, id: string, dimensionCode: string, dto: SaveResponseDto) {
    const assessment = await this.prisma.assessment.findUnique({ where: { id } });
    if (!assessment) throw new NotFoundException('Assessment not found');
    if (assessment.status === AssessmentStatus.SUBMITTED || assessment.status === AssessmentStatus.CERTIFIED) {
      throw new BadRequestException('Assessment is locked');
    }
    await this.factories.assertMember(userId, assessment.factoryId);

    const question = await this.prisma.questionBank.findFirst({
      where: {
        dimensionCode,
        OR: [{ industryGroup: assessment.industryGroup }, { industryGroup: null }],
      },
      orderBy: { industryGroup: 'desc' },
    });
    if (!question) throw new NotFoundException(`Dimension ${dimensionCode} not in question bank`);

    const weight = toNum(question.weight);
    const weighted = dto.rawScore * weight;

    return this.prisma.dimensionResponse.upsert({
      where: { assessmentId_dimensionCode: { assessmentId: id, dimensionCode } },
      create: {
        assessmentId: id,
        dimensionCode,
        buildingBlock: question.buildingBlock,
        pillar: question.pillar,
        rawScore: dto.rawScore,
        weightedScore: weighted,
        notesAr: dto.notesAr,
        notesEn: dto.notesEn,
        respondedById: userId,
      },
      update: {
        rawScore: dto.rawScore,
        weightedScore: weighted,
        notesAr: dto.notesAr,
        notesEn: dto.notesEn,
        respondedById: userId,
        respondedAt: new Date(),
      },
    });
  }

  async submit(userId: string, id: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
      include: { responses: true },
    });
    if (!assessment) throw new NotFoundException('Assessment not found');
    await this.factories.assertMember(userId, assessment.factoryId);

    const questions = await this.questionBank.forIndustry(assessment.industryGroup);
    if (assessment.responses.length < questions.length) {
      throw new BadRequestException(
        `Assessment incomplete: ${assessment.responses.length}/${questions.length} dimensions scored`,
      );
    }

    const scores = this.computeScores(assessment.responses);
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    return this.prisma.assessment.update({
      where: { id },
      data: {
        status: AssessmentStatus.SUBMITTED,
        submittedAt: now,
        expiresAt,
        overallScore: scores.overall,
        processScore: scores.process,
        technologyScore: scores.technology,
        organizationScore: scores.organization,
      },
    });
  }

  async history(userId: string, factoryId: string) {
    await this.factories.assertMember(userId, factoryId);
    return this.prisma.assessment.findMany({
      where: { factoryId },
      orderBy: { createdAt: 'desc' },
    });
  }

  computeScores(responses: { buildingBlock: BuildingBlock; rawScore: number; weightedScore: Prisma.Decimal | null }[]) {
    const byBlock = { PROCESS: [] as number[], TECHNOLOGY: [] as number[], ORGANIZATION: [] as number[] };
    for (const r of responses) byBlock[r.buildingBlock].push(r.rawScore);

    const avg = (arr: number[]) =>
      arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100 : 0;

    const process = avg(byBlock.PROCESS);
    const technology = avg(byBlock.TECHNOLOGY);
    const organization = avg(byBlock.ORGANIZATION);
    const overall = Math.round(((process + technology + organization) / 3) * 100) / 100;
    return { process, technology, organization, overall };
  }
}
