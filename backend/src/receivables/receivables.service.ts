import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Receivable } from './receivable.schema';

@Injectable()
export class ReceivablesService {
  constructor(@InjectModel(Receivable.name) private model: Model<Receivable>) {}

  async create(companyId: string, data: any) {
    const item = new this.model({
      ...data,
      companyId: new Types.ObjectId(companyId),
      expectedDate: new Date(data.expectedDate),
      categoryId: data.categoryId ? new Types.ObjectId(data.categoryId) : null,
    });
    return item.save();
  }

  async findAll(companyId: string) {
    return this.model.find({ companyId: new Types.ObjectId(companyId) }).sort({ expectedDate: 1 }).exec();
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
    if (data.expectedDate) item.expectedDate = new Date(data.expectedDate);
    if (data.categoryId) item.categoryId = new Types.ObjectId(data.categoryId);
    return item.save();
  }

  async markAsReceived(id: string, companyId: string) {
    const item = await this.findById(id, companyId);
    item.status = 'recebido';
    item.receivedAt = new Date();
    return item.save();
  }

  async remove(id: string, companyId: string) {
    const item = await this.findById(id, companyId);
    return item.deleteOne();
  }

  async getUpcomingOrOverdue(companyId: string) {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + 7);
    return this.model.find({
      companyId: new Types.ObjectId(companyId),
      status: 'pendente',
      $or: [
        { expectedDate: { $lte: future } },
      ],
    }).sort({ expectedDate: 1 }).exec();
  }
}
