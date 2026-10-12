import { Controller, Post, Get, Body, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReconciliationService } from './reconciliation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reconciliation')
@UseGuards(JwtAuthGuard)
export class ReconciliationController {
  constructor(private service: ReconciliationService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('Nenhum arquivo enviado');
    return this.service.uploadFile(req.user.id, file);
  }

  @Get('pending')
  pending(@Request() req) {
    return this.service.getPending(req.user.id);
  }

  @Post('match')
  match(@Request() req, @Body() body: { bankTxId: string; entryId: string }) {
    return this.service.manualMatch(req.user.id, body.bankTxId, body.entryId);
  }

  @Get('transactions')
  transactions(@Request() req) {
    return this.service.getAllBankTransactions(req.user.id);
  }
}
