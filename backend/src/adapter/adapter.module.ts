import { Module } from '@nestjs/common';
import { AdapterService } from './adapter.service';
import { AdapterController } from './adapter.controller';
import { KeywordModule } from '../keyword/keyword.module';
import { QualityModule } from '../quality/quality.module';

@Module({
  imports: [KeywordModule, QualityModule],
  providers: [AdapterService],
  controllers: [AdapterController],
})
export class AdapterModule {}
