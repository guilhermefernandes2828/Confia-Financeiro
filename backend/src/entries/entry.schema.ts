import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Entry extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, enum: ['entrada', 'saida'] })
  type: 'entrada' | 'saida';

  @Prop({ required: true })
  category: string;

  @Prop({ default: false })
  reconciled: boolean;

  @Prop({ type: Types.ObjectId, ref: 'BankTransaction', default: null })
  matchedBankTxId: Types.ObjectId | null;
}

export const EntrySchema = SchemaFactory.createForClass(Entry);
