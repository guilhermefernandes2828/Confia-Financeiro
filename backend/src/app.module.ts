import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { EntriesModule } from './entries/entries.module';
import { ReconciliationModule } from './reconciliation/reconciliation.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/certo-controle'),
    AuthModule,
    CompaniesModule,
    EntriesModule,
    ReconciliationModule,
  ],
})
export class AppModule {}
