import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import * as xml2js from 'xml2js';
import { BankTransaction } from './bank-transaction.schema';
import { ImportLog } from './import-log.schema';
import { EntriesService } from '../entries/entries.service';

@Injectable()
export class ReconciliationService {
  constructor(
    @InjectModel(BankTransaction.name) private bankTxModel: Model<BankTransaction>,
    @InjectModel(ImportLog.name) private importLogModel: Model<ImportLog>,
    private entriesService: EntriesService,
  ) {}

  private async getFileHash(buffer: Buffer): Promise<string> {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  async uploadFile(companyId: string, file: Express.Multer.File) {
    const hash = await this.getFileHash(file.buffer);
    const existing = await this.importLogModel.findOne({ companyId: new Types.ObjectId(companyId), fileHash: hash });
    if (existing) throw new ConflictException('Arquivo já importado anteriormente');

    let transactions: any[] = [];
    if (file.originalname.toLowerCase().endsWith('.ofx') || file.mimetype === 'application/ofx' || file.originalname.toLowerCase().endsWith('.xml')) {
      transactions = await this.parseOFX(file.buffer.toString());
    } else if (file.originalname.toLowerCase().endsWith('.csv')) {
      transactions = this.parseCSV(file.buffer.toString());
    } else {
      throw new BadRequestException('Formato não suportado. Use OFX ou CSV');
    }

    const importLog = new this.importLogModel({
      companyId: new Types.ObjectId(companyId),
      fileHash: hash,
      filename: file.originalname,
      transactionsImported: transactions.length,
    });
    await importLog.save();

    const saved = [];
    for (const tx of transactions) {
      const bankTx = new this.bankTxModel({
        ...tx,
        companyId: new Types.ObjectId(companyId),
        importHash: hash,
        date: new Date(tx.date),
      });
      saved.push(await bankTx.save());
    }

    // Auto match
    await this.autoMatch(companyId);

    return { imported: saved.length, message: 'Importação concluída com sucesso' };
  }

  private parseCSV(content: string): any[] {
    const lines = content.trim().split('\n');
    const txs = [];
    // Assume header: date,description,amount,type or similar. Simple split
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
      if (cols.length < 3) continue;
      const date = cols[0];
      const description = cols[1];
      const amount = parseFloat(cols[2].replace(',', '.'));
      const type = amount >= 0 ? 'entrada' : 'saida';
      txs.push({
        date,
        description,
        amount: Math.abs(amount),
        type,
      });
    }
    return txs;
  }

  private async parseOFX(content: string): Promise<any[]> {
    // Basic OFX parser - OFX is SGML-like but we treat as XML after cleanup
    const cleaned = content.replace(/<([^>]+)>/g, (m, p) => `<${p.replace(/\s+/g, '')}>`).replace(/&/g, '&');
    try {
      const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
      const result = await parser.parseStringPromise(cleaned);
      const stmts = result?.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKTRANLIST?.STMTTRN || [];
      const arr = Array.isArray(stmts) ? stmts : [stmts];
      return arr.map((t: any) => {
        const amount = parseFloat(t.TRNAMT || 0);
        return {
          date: this.parseOFXDate(t.DTPOSTED),
          description: t.MEMO || t.NAME || 'Sem descrição',
          amount: Math.abs(amount),
          type: amount >= 0 ? 'entrada' : 'saida',
          fitid: t.FITID,
        };
      });
    } catch (e) {
      // Fallback simple regex for common OFX
      const matches = content.match(/<STMTTRN>([\s\S]*?)<\/STMTTRN>/g) || [];
      return matches.map(m => {
        const amtMatch = m.match(/<TRNAMT>([-0-9.]+)/);
        const dateMatch = m.match(/<DTPOSTED>(\d{8})/);
        const memoMatch = m.match(/<MEMO>([^<]+)/) || m.match(/<NAME>([^<]+)/);
        const fitidMatch = m.match(/<FITID>([^<]+)/);
        const amount = parseFloat(amtMatch?.[1] || '0');
        return {
          date: dateMatch ? `${dateMatch[1].slice(0,4)}-${dateMatch[1].slice(4,6)}-${dateMatch[1].slice(6,8)}` : new Date().toISOString(),
          description: memoMatch?.[1]?.trim() || 'Transação OFX',
          amount: Math.abs(amount),
          type: amount >= 0 ? 'entrada' : 'saida',
          fitid: fitidMatch?.[1],
        };
      });
    }
  }

  private parseOFXDate(dt: string): string {
    if (!dt) return new Date().toISOString().split('T')[0];
    const clean = dt.replace(/[^0-9]/g, '').slice(0, 8);
    return `${clean.slice(0,4)}-${clean.slice(4,6)}-${clean.slice(6,8)}`;
  }

  async autoMatch(companyId: string) {
    const unreconciledEntries = await this.entriesService.findUnreconciled(companyId);
    const unmatchedBank = await this.bankTxModel.find({ companyId: new Types.ObjectId(companyId), matched: false }).exec();

    for (const bank of unmatchedBank) {
      const match = unreconciledEntries.find(e => 
        Math.abs(e.amount - bank.amount) < 0.01 &&
        Math.abs(new Date(e.date).getTime() - new Date(bank.date).getTime()) < 2 * 24 * 60 * 60 * 1000 && // ±2 days
        e.type === bank.type &&
        !e.reconciled
      );
      if (match) {
        bank.matched = true;
        bank.matchedEntryId = match._id as Types.ObjectId;
        await bank.save();
        await this.entriesService.markReconciled(match._id.toString(), bank._id.toString());
      }
    }
  }

  async manualMatch(companyId: string, bankTxId: string, entryId: string) {
    const bank = await this.bankTxModel.findById(bankTxId);
    const entry = await this.entriesService.findById(entryId, companyId);
    if (!bank || bank.companyId.toString() !== companyId.toString()) throw new BadRequestException('Transação bancária inválida');
    if (bank.matched || entry.reconciled) throw new BadRequestException('Já conciliados');
    bank.matched = true;
    bank.matchedEntryId = entry._id as Types.ObjectId;
    await bank.save();
    await this.entriesService.markReconciled(entryId, bankTxId);
    return { success: true };
  }

  async getPending(companyId: string) {
    const pendingBank = await this.bankTxModel.find({ companyId: new Types.ObjectId(companyId), matched: false }).sort({ date: -1 }).exec();
    const pendingEntries = await this.entriesService.findUnreconciled(companyId);
    const systemBalance = await this.entriesService.getBalance(companyId);
    // Simple bank balance from unmatched + matched? For demo, sum all bank
    const allBank = await this.bankTxModel.find({ companyId: new Types.ObjectId(companyId) }).exec();
    const bankBalance = allBank.reduce((sum, t) => sum + (t.type === 'entrada' ? t.amount : -t.amount), 0);
    const isReconciled = pendingBank.length === 0 && pendingEntries.length === 0 && Math.abs(systemBalance - bankBalance) < 0.01;
    return {
      pendingBank,
      pendingEntries,
      systemBalance,
      bankBalance,
      isReconciled,
    };
  }

  async getAllBankTransactions(companyId: string) {
    return this.bankTxModel.find({ companyId: new Types.ObjectId(companyId) }).sort({ date: -1 }).exec();
  }
}
