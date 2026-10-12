import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Entry, EntrySchema } from './entry.schema';
import { EntriesService } from './entries.service';
import { EntriesController } from './entries.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Entry.name, schema: EntrySchema }])],
  providers: [EntriesService],
  controllers: [EntriesController],
  exports: [EntriesService],
})
export class EntriesModule {}
