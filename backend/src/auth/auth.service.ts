import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CompaniesService } from '../companies/companies.service';

@Injectable()
export class AuthService {
  constructor(
    private companiesService: CompaniesService,
    private jwtService: JwtService,
  ) {}

  async register(data: { name: string; cnpj: string; email: string; password: string }) {
    const company = await this.companiesService.create(data);
    const token = this.generateToken(company);
    return { token, company: { id: company._id, name: company.name, email: company.email, cnpj: company.cnpj } };
  }

  async login(email: string, password: string) {
    const company = await this.companiesService.findByEmail(email);
    if (!company || !(await this.companiesService.validatePassword(company, password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const token = this.generateToken(company);
    return { token, company: { id: company._id, name: company.name, email: company.email, cnpj: company.cnpj } };
  }

  private generateToken(company: any) {
    const payload = { sub: company._id, email: company.email };
    return this.jwtService.sign(payload);
  }
}
