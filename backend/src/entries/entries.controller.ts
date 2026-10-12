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
