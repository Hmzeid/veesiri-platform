import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RoadmapService } from './roadmap.service';

@UseGuards(JwtAuthGuard)
@Controller('roadmaps')
export class RoadmapController {
  constructor(private service: RoadmapService) {}

  @Get('latest')
  latest(@Req() req: any, @Query('factoryId') factoryId: string) {
    return this.service.latestForFactory(req.user.sub, factoryId);
  }

  @Get(':id')
  get(@Req() req: any, @Param('id') id: string) {
    return this.service.get(req.user.sub, id);
  }

  @Post(':id/approve')
  approve(@Req() req: any, @Param('id') id: string) {
    return this.service.approve(req.user.sub, id);
  }

  @Put('milestones/:mid/complete')
  completeMilestone(@Req() req: any, @Param('mid') mid: string) {
    return this.service.completeMilestone(req.user.sub, mid);
  }

  @Put('initiatives/:iid/progress')
  progress(@Req() req: any, @Param('iid') iid: string, @Body() body: { percent: number }) {
    return this.service.updateInitiativeProgress(req.user.sub, iid, body.percent);
  }
}
