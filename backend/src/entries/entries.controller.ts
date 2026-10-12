import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { EntriesService } from './entries.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('entries')
@UseGuards(JwtAuthGuard)
export class EntriesController {
  constructor(private entriesService: EntriesService) {}

  @Get()
  findAll(@Request() req, @Query() query: any) {
    return this.entriesService.findAll(req.user.id, query);
  }

  @Get('balance')
  getBalance(@Request() req) {
    return this.entriesService.getBalance(req.user.id);
  }

  @Get('monthly')
  async monthly(@Request() req, @Query('month') month: string, @Query('category') category?: string) {
    // month format: YYYY-MM
    const [year, m] = month.split('-').map(Number);
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 0, 23, 59, 59);
    const filters: any = { from: start.toISOString(), to: end.toISOString() };
    if (category) filters.category = category;
    const entries = await this.entriesService.findAll(req.user.id, { ...filters, limit: 1000 });
    const entradas = entries.data.filter((e: any) => e.type === 'entrada').reduce((s: number, e: any) => s + e.amount, 0);
    const saidas = entries.data.filter((e: any) => e.type === 'saida').reduce((s: number, e: any) => s + e.amount, 0);
    return { entradas, saidas, saldo: entradas - saidas, entries: entries.data };
  }

  @Post()
  create(@Request() req, @Body() body: any) {
    return this.entriesService.create(req.user.id, body);
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.entriesService.update(id, req.user.id, body);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.entriesService.remove(id, req.user.id);
  }
}
