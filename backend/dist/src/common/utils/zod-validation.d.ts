import { z } from 'zod';
export declare const parseWithZod: <T>(schema: z.ZodType<T>, payload: unknown) => T;
