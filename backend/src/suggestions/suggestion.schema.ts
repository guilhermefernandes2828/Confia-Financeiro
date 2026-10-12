import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Suggestion extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  whatsapp: string;

  @Prop({ required: true })
  feature: string;

  @Prop()
  help: string;
}

export const SuggestionSchema = SchemaFactory.createForClass(Suggestion);
