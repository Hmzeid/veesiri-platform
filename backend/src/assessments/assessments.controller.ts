import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AssessmentsService } from './assessments.service';
import { SaveResponseDto, StartAssessmentDto } from './assessments.dto';

@UseGuards(JwtAuthGuard)
@Controller('assessments')
export class AssessmentsController {
  constructor(private service: AssessmentsService) {}

  @Post()
  start(@Req() req: any, @Body() dto: StartAssessmentDto) {
    return this.service.start(req.user.sub, dto.factoryId);
  }

  @Get('history')
  history(@Req() req: any, @Query('factoryId') factoryId: string) {
    return this.service.history(req.user.sub, factoryId);
  }

  @Get(':id')
  get(@Req() req: any, @Param('id') id: string) {
    return this.service.get(req.user.sub, id);
  }

  @Put(':id/dimensions/:code')
  save(
    @Req() req: any,
    @Param('id') id: string,
    @Param('code') code: string,
    @Body() dto: SaveResponseDto,
  ) {
    return this.service.saveResponse(req.user.sub, id, code, dto);
  }

  @Post(':id/submit')
  submit(@Req() req: any, @Param('id') id: string) {
    return this.service.submit(req.user.sub, id);
  }
}
