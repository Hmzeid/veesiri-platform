import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FactoriesModule } from './factories/factories.module';
import { QuestionBankModule } from './question-bank/question-bank.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { GapAnalysisModule } from './gap-analysis/gap-analysis.module';
import { RoadmapModule } from './roadmap/roadmap.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DocumentsModule } from './documents/documents.module';
import { CertificatesModule } from './certificates/certificates.module';
import { GovModule } from './gov/gov.module';
import { BenchmarksModule } from './benchmarks/benchmarks.module';
import { PublicModule } from './public/public.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    FactoriesModule,
    QuestionBankModule,
    AssessmentsModule,
    GapAnalysisModule,
    RoadmapModule,
    RecommendationsModule,
    NotificationsModule,
    DocumentsModule,
    CertificatesModule,
    GovModule,
    BenchmarksModule,
    PublicModule,
    AiModule,
  ],
})
export class AppModule {}
