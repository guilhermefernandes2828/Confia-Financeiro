import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Company } from './company.schema';

@Injectable()
export class CompaniesService {
  constructor(@InjectModel(Company.name) private companyModel: Model<Company>) {}

  async create(data: { name: string; cnpj: string; email: string; password: string }): Promise<Company> {
    const existing = await this.companyModel.findOne({ $or: [{ email: data.email }, { cnpj: data.cnpj }] });
    if (existing) throw new ConflictException('Email ou CNPJ já cadastrado');
    const passwordHash = await bcrypt.hash(data.password, 10);
    const company = new this.companyModel({ ...data, passwordHash });
    return company.save();
  }

  async findByEmail(email: string): Promise<Company | null> {
    return this.companyModel.findOne({ email });
  }

  async findById(id: string): Promise<Company> {
    const company = await this.companyModel.findById(id);
    if (!company) throw new NotFoundException('Empresa não encontrada');
    return company;
  }

  async validatePassword(company: Company, password: string): Promise<boolean> {
    return bcrypt.compare(password, company.passwordHash);
  }
}
