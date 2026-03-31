import { Global, Module } from '@nestjs/common';
import { QdrantService } from './qdrant.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [QdrantService],
  exports: [QdrantService],
})
export class QdrantModule {}
