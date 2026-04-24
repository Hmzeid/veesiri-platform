import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { DocumentsService, CreateDocumentInput } from './documents.service';

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private service: DocumentsService) {}

  @Get('folders')
  folders(@Req() req: any, @Query('factoryId') factoryId: string) {
    return this.service.folders(req.user.sub, factoryId);
  }

  @Get()
  list(@Req() req: any, @Query('factoryId') factoryId: string, @Query('folderId') folderId?: string) {
    return this.service.list(req.user.sub, factoryId, folderId);
  }

  @Post()
  create(@Req() req: any, @Query('factoryId') factoryId: string, @Body() dto: CreateDocumentInput) {
    return this.service.create(req.user.sub, factoryId, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.softDelete(req.user.sub, id);
  }

  @Get('expiring')
  expiring(@Req() req: any, @Query('factoryId') factoryId: string, @Query('days') days = '90') {
    return this.service.expiring(req.user.sub, factoryId, Number(days));
  }
}
