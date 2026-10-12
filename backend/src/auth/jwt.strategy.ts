import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CompaniesService } from '../companies/companies.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private companiesService: CompaniesService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    });
  }

  async validate(payload: any) {
    const company = await this.companiesService.findById(payload.sub);
    return { id: company._id.toString(), name: company.name, email: company.email, cnpj: company.cnpj };
  }
}
