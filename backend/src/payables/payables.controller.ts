import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PayablesService } from './payables.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payables')
@UseGuards(JwtAuthGuard)
export class PayablesController {
  constructor(private service: PayablesService) {}

  @Get()
  findAll(@Request() req) {
    return this.service.findAll(req.user.id);
  }

  @Get('upcoming')
  upcoming(@Request() req) {
    return this.service.getUpcoming(req.user.id);
  }

  @Post()
  create(@Request() req, @Body() body: any) {
    return this.service.create(req.user.id, body);
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.service.update(id, req.user.id, body);
  }

  @Put(':id/pay')
  markAsPaid(@Request() req, @Param('id') id: string) {
    return this.service.markAsPaid(id, req.user.id);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.service.remove(id, req.user.id);
  }
}
