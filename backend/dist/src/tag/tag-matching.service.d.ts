import { PrismaService } from '../prisma/prisma.service';
import { Tag } from '@prisma/client';
export declare class TagMatchingService {
    private prisma;
    constructor(prisma: PrismaService);
    autoTagSession(content: string, deptId?: string): Promise<Tag[]>;
}
