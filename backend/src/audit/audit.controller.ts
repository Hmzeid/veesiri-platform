import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AuditService } from './audit.service';

@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private svc: AuditService) {}

  @Get('log')
  log(@Req() req: any, @Query('factoryId') factoryId: string) {
    return this.svc.forFactory(req.user.sub, factoryId);
  }

  @Get('forecast')
  forecast(@Req() req: any, @Query('factoryId') factoryId: string) {
    return this.svc.forecast(req.user.sub, factoryId);
  }

  @Get('sustainability')
  sustainability(@Req() req: any, @Query('factoryId') factoryId: string) {
    return this.svc.sustainability(req.user.sub, factoryId);
  }
}
