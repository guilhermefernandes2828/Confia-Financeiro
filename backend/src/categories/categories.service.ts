import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from './category.schema';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private model: Model<Category>) {}

  async create(companyId: string, data: { name: string; color?: string }) {
    const cat = new this.model({ ...data, companyId: new Types.ObjectId(companyId) });
    return cat.save();
  }

  async findAll(companyId: string) {
    return this.model.find({ companyId: new Types.ObjectId(companyId) }).sort({ name: 1 }).exec();
  }

  async findById(id: string, companyId: string) {
    const cat = await this.model.findById(id);
    if (!cat) throw new NotFoundException();
    if (cat.companyId.toString() !== companyId.toString()) throw new ForbiddenException();
    return cat;
  }

  async update(id: string, companyId: string, data: any) {
    const cat = await this.findById(id, companyId);
    Object.assign(cat, data);
    return cat.save();
  }

  async remove(id: string, companyId: string) {
    const cat = await this.findById(id, companyId);
    return cat.deleteOne();
  }
}
