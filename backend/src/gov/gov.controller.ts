import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { GovService } from './gov.service';
import { GovAuthService } from './gov-auth.service';
import { GovAuthGuard } from './gov-auth.guard';

@Controller('gov')
export class GovController {
  constructor(
    private svc: GovService,
    private auth: GovAuthService,
  ) {}

  @Post('auth/login')
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }

  @UseGuards(GovAuthGuard)
  @Get('auth/me')
  me(@Req() req: any) {
    return this.auth.me(req.govUser.sub);
  }

  @UseGuards(GovAuthGuard)
  @Get('dashboard/summary')
  summary(@Req() req: any) {
    return this.svc.summary(req.govUser.regionScope);
  }

  @UseGuards(GovAuthGuard)
  @Get('dashboard/map')
  map(@Req() req: any) {
    return this.svc.mapData(req.govUser.regionScope);
  }

  @UseGuards(GovAuthGuard)
  @Get('dashboard/regions')
  regions(@Req() req: any) {
    return this.svc.regions(req.govUser.regionScope);
  }

  @UseGuards(GovAuthGuard)
  @Get('dashboard/sectors')
  sectors(@Req() req: any) {
    return this.svc.sectors(req.govUser.regionScope);
  }

  @UseGuards(GovAuthGuard)
  @Get('dashboard/leaderboard')
  leaderboard(@Req() req: any) {
    return this.svc.leaderboard(req.govUser.regionScope);
  }

  @UseGuards(GovAuthGuard)
  @Get('dashboard/score-distribution')
  distribution(@Req() req: any) {
    return this.svc.scoreDistribution(req.govUser.regionScope);
  }

  @UseGuards(GovAuthGuard)
  @Get('dashboard/activity')
  activity(@Req() req: any) {
    return this.svc.activityFeed(req.govUser.regionScope);
  }

  @UseGuards(GovAuthGuard)
  @Get('dashboard/trends')
  trends(@Req() req: any) {
    return this.svc.trends(req.govUser.regionScope);
  }

  @UseGuards(GovAuthGuard)
  @Get('dashboard/heatmap')
  heatmap(@Req() req: any) {
    return this.svc.heatmap(req.govUser.regionScope);
  }

  @UseGuards(GovAuthGuard)
  @Get('alerts')
  alerts(@Req() req: any) {
    return this.svc.alerts(req.govUser.regionScope);
  }

  @UseGuards(GovAuthGuard)
  @Put('alerts/:id/resolve')
  resolve(@Param('id') id: string) {
    return this.svc.resolveAlert(id);
  }

  @UseGuards(GovAuthGuard)
  @Get('factories/:id')
  factoryDetail(@Req() req: any, @Param('id') id: string) {
    return this.svc.factoryDetail(id, req.govUser.regionScope);
  }

  @UseGuards(GovAuthGuard)
  @Get('search/factories')
  search(
    @Req() req: any,
    @Query('q') q?: string,
    @Query('industry') industry?: string,
    @Query('region') region?: string,
  ) {
    return this.svc.search(q ?? '', industry, region, req.govUser.regionScope);
  }

  @UseGuards(GovAuthGuard)
  @Post('compare')
  compare(@Req() req: any, @Body() body: { ids: string[] }) {
    return this.svc.compare(body.ids, req.govUser.regionScope);
  }
}
