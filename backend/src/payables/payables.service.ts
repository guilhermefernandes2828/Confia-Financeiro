import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payable } from './payable.schema';

@Injectable()
export class PayablesService {
  constructor(@InjectModel(Payable.name) private model: Model<Payable>) {}

  async create(companyId: string, data: any) {
    const item = new this.model({
      ...data,
      companyId: new Types.ObjectId(companyId),
      dueDate: new Date(data.dueDate),
      categoryId: data.categoryId ? new Types.ObjectId(data.categoryId) : null,
    });
    return item.save();
  }

  async findAll(companyId: string) {
    return this.model.find({ companyId: new Types.ObjectId(companyId) }).sort({ dueDate: 1 }).exec();
  }

  async findById(id: string, companyId: string) {
    const item = await this.model.findById(id);
    if (!item) throw new NotFoundException();
    if (item.companyId.toString() !== companyId.toString()) throw new ForbiddenException();
    return item;
  }

  async update(id: string, companyId: string, data: any) {
    const item = await this.findById(id, companyId);
    Object.assign(item, data);
    if (data.dueDate) item.dueDate = new Date(data.dueDate);
    if (data.categoryId) item.categoryId = new Types.ObjectId(data.categoryId);
    return item.save();
  }

  async markAsPaid(id: string, companyId: string) {
    const item = await this.findById(id, companyId);
    item.status = 'pago';
    item.paidAt = new Date();
    return item.save();
  }

  async remove(id: string, companyId: string) {
    const item = await this.findById(id, companyId);
    return item.deleteOne();
  }

  async getUpcoming(companyId: string, days = 7) {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);
    return this.model.find({
      companyId: new Types.ObjectId(companyId),
      status: 'pendente',
      dueDate: { $gte: now, $lte: future },
    }).sort({ dueDate: 1 }).exec();
  }
}
