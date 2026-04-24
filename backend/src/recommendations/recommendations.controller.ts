import { Body, Controller, Get, Param, Put, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RecommendationsService } from './recommendations.service';

@UseGuards(JwtAuthGuard)
@Controller('recommendations')
export class RecommendationsController {
  constructor(private service: RecommendationsService) {}

  @Get()
  list(@Req() req: any, @Query('factoryId') factoryId: string) {
    return this.service.listForFactory(req.user.sub, factoryId);
  }

  @Put(':id/feedback')
  feedback(@Req() req: any, @Param('id') id: string, @Body() body: { value: 'helpful' | 'not_helpful' }) {
    return this.service.feedback(req.user.sub, id, body.value);
  }
}
