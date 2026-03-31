import { z } from 'zod';
export declare const updateAiConfigSchema: z.ZodObject<{
    baseUrl: z.ZodOptional<z.ZodURL>;
    apiKey: z.ZodOptional<z.ZodString>;
    chatModel: z.ZodOptional<z.ZodString>;
    embeddingModel: z.ZodOptional<z.ZodString>;
    timeoutMs: z.ZodOptional<z.ZodNumber>;
    retries: z.ZodOptional<z.ZodNumber>;
    vectorSize: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const testAiConfigSchema: z.ZodObject<{
    baseUrl: z.ZodOptional<z.ZodURL>;
    apiKey: z.ZodOptional<z.ZodString>;
    timeoutMs: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type UpdateAiConfigInput = z.infer<typeof updateAiConfigSchema>;
export type TestAiConfigInput = z.infer<typeof testAiConfigSchema>;
