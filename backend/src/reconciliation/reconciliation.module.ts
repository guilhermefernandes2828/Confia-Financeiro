import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BankTransaction, BankTransactionSchema } from './bank-transaction.schema';
import { ImportLog, ImportLogSchema } from './import-log.schema';
import { ReconciliationService } from './reconciliation.service';
import { ReconciliationController } from './reconciliation.controller';
import { EntriesModule } from '../entries/entries.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BankTransaction.name, schema: BankTransactionSchema },
      { name: ImportLog.name, schema: ImportLogSchema },
    ]),
    EntriesModule,
  ],
  providers: [ReconciliationService],
  controllers: [ReconciliationController],
})
export class ReconciliationModule {}
