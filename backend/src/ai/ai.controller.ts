import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AiService } from './ai.service';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private svc: AiService) {}

  @Post('chat')
  chat(@Req() req: any, @Body() body: { factoryId?: string; message: string; lang?: 'en' | 'ar' }) {
    return this.svc.chat(req.user.sub, body.factoryId, body.message, body.lang ?? 'en');
  }
}
