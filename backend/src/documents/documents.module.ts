import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FactoriesModule } from '../factories/factories.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [AuthModule, FactoriesModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
