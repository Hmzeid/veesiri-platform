import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GapAnalysisService } from './gap-analysis.service';
import { GenerateGapDto } from './gap-analysis.dto';

@UseGuards(JwtAuthGuard)
@Controller('gap-analysis')
export class GapAnalysisController {
  constructor(private service: GapAnalysisService) {}

  @Post()
  generate(@Req() req: any, @Body() dto: GenerateGapDto) {
    return this.service.generate(req.user.sub, dto.assessmentId, dto.targetScore, dto.targetDate);
  }

  @Get('latest')
  latest(@Req() req: any, @Query('factoryId') factoryId: string) {
    return this.service.latestForFactory(req.user.sub, factoryId);
  }

  @Get('by-factory/:factoryId')
  listByFactory(@Req() req: any, @Param('factoryId') factoryId: string) {
    return this.service.listByFactory(req.user.sub, factoryId);
  }

  @Get(':id')
  get(@Req() req: any, @Param('id') id: string) {
    return this.service.get(req.user.sub, id);
  }
}
