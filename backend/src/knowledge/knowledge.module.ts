import { Module, forwardRef } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { OssModule } from '../oss/oss.module';
import { QdrantModule } from '../qdrant/qdrant.module';
import { AiModule } from '../ai/ai.module';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [OssModule, QdrantModule, AiModule, forwardRef(() => SocketModule)],
  providers: [KnowledgeService],
  controllers: [KnowledgeController],
})
export class KnowledgeModule {}
