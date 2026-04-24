import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CertificatesService } from './certificates.service';

@Controller('certificates')
export class CertificatesController {
  constructor(private service: CertificatesService) {}

  @Get('verify/:code')
  verify(@Param('code') code: string) {
    return this.service.verifyPublic(code);
  }

  @UseGuards(JwtAuthGuard)
  @Get('latest')
  latest(@Req() req: any, @Query('factoryId') factoryId: string) {
    return this.service.latestForFactory(req.user.sub, factoryId);
  }
}
