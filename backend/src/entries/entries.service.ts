import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Entry } from './entry.schema';

@Injectable()
export class EntriesService {
  constructor(@InjectModel(Entry.name) private entryModel: Model<Entry>) {}

  async create(companyId: string, data: any) {
    const entry = new this.entryModel({ ...data, companyId: new Types.ObjectId(companyId), date: new Date(data.date) });
    return entry.save();
  }

  async findAll(companyId: string, filters: { from?: string; to?: string; type?: string; search?: string; category?: string; page?: number; limit?: number } = {}) {
    const query: any = { companyId: new Types.ObjectId(companyId) };
    if (filters.type) query.type = filters.type;
    if (filters.search) query.description = { $regex: filters.search, $options: 'i' };
    if (filters.category) query.category = filters.category;
    if (filters.from || filters.to) {
      query.date = {};
      if (filters.from) query.date.$gte = new Date(filters.from);
      if (filters.to) query.date.$lte = new Date(filters.to);
    }
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.entryModel.find(query).sort({ date: -1 }).skip(skip).limit(limit).exec(),
      this.entryModel.countDocuments(query),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string, companyId: string) {
    const entry = await this.entryModel.findById(id);
    if (!entry) throw new NotFoundException();
    if (entry.companyId.toString() !== companyId.toString()) throw new ForbiddenException();
    return entry;
  }

  async update(id: string, companyId: string, data: any) {
    const entry = await this.findById(id, companyId);
    Object.assign(entry, data);
    if (data.date) entry.date = new Date(data.date);
    return entry.save();
  }

  async remove(id: string, companyId: string) {
    const entry = await this.findById(id, companyId);
    return entry.deleteOne();
  }

  async getBalance(companyId: string) {
    const result = await this.entryModel.aggregate([
      { $match: { companyId: new Types.ObjectId(companyId) } },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $cond: [{ $eq: ['$type', 'entrada'] }, '$amount', { $multiply: ['$amount', -1] }],
            },
          },
        },
      },
    ]);
    return result[0]?.total || 0;
  }

  async findUnreconciled(companyId: string) {
    return this.entryModel.find({ companyId: new Types.ObjectId(companyId), reconciled: false }).exec();
  }

  async markReconciled(id: string, bankTxId: string) {
    return this.entryModel.findByIdAndUpdate(id, { reconciled: true, matchedBankTxId: new Types.ObjectId(bankTxId) }, { new: true });
  }
}
