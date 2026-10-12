import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Receivable extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  expectedDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  categoryId: Types.ObjectId;

  @Prop({ default: 'pendente', enum: ['pendente', 'recebido'] })
  status: 'pendente' | 'recebido';

  @Prop()
  receivedAt?: Date;
}

export const ReceivableSchema = SchemaFactory.createForClass(Receivable);
