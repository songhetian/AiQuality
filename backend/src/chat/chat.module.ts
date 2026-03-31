import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { KeywordModule } from '../keyword/keyword.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [KeywordModule, AiModule],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
