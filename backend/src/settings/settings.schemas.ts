import { z } from 'zod';

const optionalTrimmedString = z
  .string()
  .trim()
  .min(1, '不能为空')
  .optional();

export const updateAiConfigSchema = z.object({
  baseUrl: z.url('AI Base URL 格式不正确').optional(),
  apiKey: optionalTrimmedString,
  chatModel: optionalTrimmedString,
  embeddingModel: optionalTrimmedString,
  timeoutMs: z
    .number()
    .int('超时必须是整数')
    .min(1000, '超时不能小于 1000ms')
    .max(120000, '超时不能超过 120000ms')
    .optional(),
  retries: z
    .number()
    .int('重试次数必须是整数')
    .min(0, '重试次数不能小于 0')
    .max(10, '重试次数不能超过 10')
    .optional(),
  vectorSize: z
    .number()
    .int('向量维度必须是整数')
    .min(128, '向量维度不能小于 128')
    .max(8192, '向量维度不能超过 8192')
    .optional(),
});

export const testAiConfigSchema = z.object({
  baseUrl: z.url('AI Base URL 格式不正确').optional(),
  apiKey: optionalTrimmedString,
  timeoutMs: z
    .number()
    .int('超时必须是整数')
    .min(1000, '超时不能小于 1000ms')
    .max(120000, '超时不能超过 120000ms')
    .optional(),
});

export type UpdateAiConfigInput = z.infer<typeof updateAiConfigSchema>;
export type TestAiConfigInput = z.infer<typeof testAiConfigSchema>;
