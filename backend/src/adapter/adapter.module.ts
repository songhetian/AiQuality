import { Module } from '@nestjs/common';
import { AdapterService } from './adapter.service';
import { AdapterController } from './adapter.controller';
import { KeywordModule } from '../keyword/keyword.module';

@Module({
  imports: [KeywordModule],
  providers: [AdapterService],
  controllers: [AdapterController],
})
export class AdapterModule {}
