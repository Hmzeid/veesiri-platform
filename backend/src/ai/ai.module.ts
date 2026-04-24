import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FactoriesModule } from '../factories/factories.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [AuthModule, FactoriesModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
