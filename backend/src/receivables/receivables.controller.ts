import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReceivablesService } from './receivables.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('receivables')
@UseGuards(JwtAuthGuard)
export class ReceivablesController {
  constructor(private service: ReceivablesService) {}

  @Get()
  findAll(@Request() req) {
    return this.service.findAll(req.user.id);
  }

  @Get('alerts')
  alerts(@Request() req) {
    return this.service.getUpcomingOrOverdue(req.user.id);
  }

  @Post()
  create(@Request() req, @Body() body: any) {
    return this.service.create(req.user.id, body);
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.service.update(id, req.user.id, body);
  }

  @Put(':id/receive')
  markAsReceived(@Request() req, @Param('id') id: string) {
    return this.service.markAsReceived(id, req.user.id);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.service.remove(id, req.user.id);
  }
}
