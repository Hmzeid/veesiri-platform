import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { IndustryGroup } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { BenchmarksService } from './benchmarks.service';

@UseGuards(JwtAuthGuard)
@Controller('benchmarks')
export class BenchmarksController {
  constructor(private svc: BenchmarksService) {}

  @Get(':industryGroup')
  forIndustry(@Param('industryGroup') industryGroup: IndustryGroup) {
    return this.svc.forIndustry(industryGroup);
  }
}
