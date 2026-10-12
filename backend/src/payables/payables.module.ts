import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payable, PayableSchema } from './payable.schema';
import { PayablesService } from './payables.service';
import { PayablesController } from './payables.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Payable.name, schema: PayableSchema }])],
  providers: [PayablesService],
  controllers: [PayablesController],
  exports: [PayablesService],
})
export class PayablesModule {}
