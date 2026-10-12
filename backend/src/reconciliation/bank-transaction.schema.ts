import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class BankTransaction extends Document {
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

  @Prop()
  fitid?: string; // OFX unique id

  @Prop({ default: false })
  matched: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Entry', default: null })
  matchedEntryId: Types.ObjectId | null;

  @Prop({ required: true })
  importHash: string; // to avoid duplicates
}

export const BankTransactionSchema = SchemaFactory.createForClass(BankTransaction);
