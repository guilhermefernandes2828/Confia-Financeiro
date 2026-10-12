import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Suggestion } from './suggestion.schema';

@Injectable()
export class SuggestionsService {
  constructor(@InjectModel(Suggestion.name) private model: Model<Suggestion>) {}

  async create(data: any) {
    const suggestion = new this.model(data);
    return suggestion.save();
  }

  async findAll() {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }
}
