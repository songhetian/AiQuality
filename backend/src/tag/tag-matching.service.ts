import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Tag } from '@prisma/client';

@Injectable()
export class TagMatchingService {
  constructor(private prisma: PrismaService) {}

  /**
   * 对文本进行自动打标
   */
  async autoTagSession(content: string, deptId?: string): Promise<Tag[]> {
    const tags = await this.prisma.tag.findMany({
      where: {
        status: 1,
        OR: [{ deptId: deptId }, { deptId: null }],
      },
    });

    const matchedTags: Tag[] = [];

    for (const tag of tags) {
      if (!tag.aiMatchRule) continue;

      try {
        const regex = new RegExp(tag.aiMatchRule, 'i');
        if (regex.test(content)) {
          matchedTags.push(tag);
        }
      } catch (e) {
        // Log error
      }
    }

    return matchedTags;
  }
}
