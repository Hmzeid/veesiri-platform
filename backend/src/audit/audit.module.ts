import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FactoriesModule } from '../factories/factories.module';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

@Module({
  imports: [AuthModule, FactoriesModule],
  controllers: [AuditController],
  providers: [AuditService],
})
export class AuditModule {}
