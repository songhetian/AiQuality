import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { InsightService } from './insight.service';
import { AiIntegrationService } from './ai-integration.service';
import { CostModule } from '../cost/cost.module';

@Module({
  imports: [CostModule],
  providers: [AiService, InsightService, AiIntegrationService],
  controllers: [AiController],
})
export class AiModule {}
