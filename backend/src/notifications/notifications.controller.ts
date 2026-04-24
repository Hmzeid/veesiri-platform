import { Controller, Get, Param, Put, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Get()
  list(@Req() req: any, @Query('unread') unread?: string) {
    return this.service.list(req.user.sub, unread === 'true');
  }

  @Get('count-unread')
  count(@Req() req: any) {
    return this.service.countUnread(req.user.sub).then((count) => ({ count }));
  }

  @Put(':id/read')
  markRead(@Req() req: any, @Param('id') id: string) {
    return this.service.markRead(req.user.sub, id);
  }

  @Put('read-all')
  markAll(@Req() req: any) {
    return this.service.markAllRead(req.user.sub);
  }
}
