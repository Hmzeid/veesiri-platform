import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FactoriesModule } from '../factories/factories.module';
import { GapAnalysisController } from './gap-analysis.controller';
import { GapAnalysisService } from './gap-analysis.service';

@Module({
  imports: [AuthModule, FactoriesModule],
  controllers: [GapAnalysisController],
  providers: [GapAnalysisService],
})
export class GapAnalysisModule {}
