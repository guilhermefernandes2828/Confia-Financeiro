import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ImportLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  fileHash: string;

  @Prop()
  filename: string;

  @Prop({ default: 0 })
  transactionsImported: number;
}

export const ImportLogSchema = SchemaFactory.createForClass(ImportLog);
