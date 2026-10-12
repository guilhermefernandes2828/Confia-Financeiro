import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Receivable, ReceivableSchema } from './receivable.schema';
import { ReceivablesService } from './receivables.service';
import { ReceivablesController } from './receivables.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Receivable.name, schema: ReceivableSchema }])],
  providers: [ReceivablesService],
  controllers: [ReceivablesController],
  exports: [ReceivablesService],
})
export class ReceivablesModule {}
