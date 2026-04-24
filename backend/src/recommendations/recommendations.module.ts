import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FactoriesModule } from '../factories/factories.module';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';

@Module({
  imports: [AuthModule, FactoriesModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}
