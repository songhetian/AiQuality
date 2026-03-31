import { Module, forwardRef } from '@nestjs/common';
import { QualityService } from './quality.service';
import { QualityController } from './quality.controller';
import { AiIntegrationService } from '../ai/ai-integration.service';
import { SocketModule } from '../socket/socket.module';
import { BullModule } from '@nestjs/bull';
import { QualityProcessor } from './quality.processor';

import { TagMatchingService } from '../tag/tag-matching.service';

@Module({
  imports: [
    forwardRef(() => SocketModule),
    BullModule.registerQueue({
      name: 'quality-queue',
    }),
  ],
  providers: [
    QualityService,
    AiIntegrationService,
    QualityProcessor,
    TagMatchingService,
  ],
  controllers: [QualityController],
  exports: [QualityService],
})
export class QualityModule {}
