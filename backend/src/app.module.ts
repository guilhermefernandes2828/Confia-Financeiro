import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { CompaniesModule } from './companies/companies.module';
import { EntriesModule } from './entries/entries.module';
import { PayablesModule } from './payables/payables.module';
import { ReceivablesModule } from './receivables/receivables.module';
import { ReconciliationModule } from './reconciliation/reconciliation.module';
import { SuggestionsModule } from './suggestions/suggestions.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/certo-controle'
    ),
    AuthModule,
    CompaniesModule,
    EntriesModule,
    ReconciliationModule,
    CategoriesModule,
    PayablesModule,
    ReceivablesModule,
    SuggestionsModule,
  ],
})
export class AppModule {}
