import { z } from 'zod';

const nonEmptyString = (label: string) =>
  z.string().trim().min(1, `${label}不能为空`);

const nullableString = z.string().trim().min(1).nullable().optional();

const jsonString = (label: string) =>
  z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (!value) {
        return;
      }

      try {
        JSON.parse(value);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${label} 不是合法的 JSON`,
        });
      }
    })
    .optional()
    .nullable();

export const adapterMappingSchema = z.object({
  thirdPartyFields: nonEmptyString('第三方字段'),
  systemFields: nonEmptyString('系统字段'),
  formatMapping: nullableString,
  remark: nullableString,
});

export const adapterUpsertSchema = z.object({
  name: nonEmptyString('接口名称'),
  type: nonEmptyString('接口类型'),
  url: z.url('接口地址格式不正确'),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  platformId: nonEmptyString('平台'),
  deptId: nullableString,
  headers: jsonString('Headers JSON'),
  authParams: jsonString('认证参数 JSON'),
  enableFakeData: z.boolean().optional(),
  status: z.union([z.literal(0), z.literal(1)]).optional(),
  mappings: z.array(adapterMappingSchema).default([]),
});

export const adapterStatusSchema = z.object({
  status: z.union([z.literal(0), z.literal(1)]),
});

export const adapterCollectSchema = z
  .object({
    persist: z.boolean().optional(),
  })
  .optional();

export const adapterFakeDataSchema = z.object({
  data: z.unknown(),
  scene: z.string().trim().min(1).optional(),
});

export const adapterFakeModeSchema = z.object({
  enable: z.boolean(),
});

export type AdapterUpsertInput = z.infer<typeof adapterUpsertSchema>;
export type AdapterStatusInput = z.infer<typeof adapterStatusSchema>;
export type AdapterCollectInput = z.infer<typeof adapterCollectSchema>;
export type AdapterFakeDataInput = z.infer<typeof adapterFakeDataSchema>;
export type AdapterFakeModeInput = z.infer<typeof adapterFakeModeSchema>;
