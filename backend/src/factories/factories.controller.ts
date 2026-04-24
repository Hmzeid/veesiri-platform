import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { FactoryRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { FactoriesService } from './factories.service';
import { CreateFactoryDto, UpdateFactoryDto } from './factories.dto';

@UseGuards(JwtAuthGuard)
@Controller('factories')
export class FactoriesController {
  constructor(private factories: FactoriesService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateFactoryDto) {
    return this.factories.create(req.user.sub, dto);
  }

  @Get()
  list(@Req() req: any) {
    return this.factories.list(req.user.sub);
  }

  @Get(':id')
  get(@Req() req: any, @Param('id') id: string) {
    return this.factories.get(req.user.sub, id);
  }

  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateFactoryDto) {
    return this.factories.update(req.user.sub, id, dto);
  }

  @Get(':id/team')
  team(@Req() req: any, @Param('id') id: string) {
    return this.factories.listTeam(req.user.sub, id);
  }

  @Post(':id/team')
  invite(@Req() req: any, @Param('id') id: string, @Body() dto: { email: string; role: FactoryRole }) {
    return this.factories.inviteMember(req.user.sub, id, dto.email, dto.role);
  }

  @Put(':id/team/:userId/role')
  role(@Req() req: any, @Param('id') id: string, @Param('userId') uid: string, @Body() dto: { role: FactoryRole }) {
    return this.factories.updateMemberRole(req.user.sub, id, uid, dto.role);
  }

  @Delete(':id/team/:userId')
  remove(@Req() req: any, @Param('id') id: string, @Param('userId') uid: string) {
    return this.factories.removeMember(req.user.sub, id, uid);
  }
}
