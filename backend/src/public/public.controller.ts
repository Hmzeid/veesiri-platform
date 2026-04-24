import { Controller, Get } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private svc: PublicService) {}

  @Get('stats')
  stats() {
    return this.svc.landingStats();
  }

  @Get('map')
  map() {
    return this.svc.publicMap();
  }
}
