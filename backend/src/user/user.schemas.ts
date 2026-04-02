import { z } from 'zod';

const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

const nullableRelationId = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value !== 'string') {
      return undefined;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  });

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  username: z.string().trim().optional(),
  status: z
    .union([z.coerce.number().int(), z.literal(''), z.null(), z.undefined()])
    .transform((value) => (typeof value === 'number' ? value : undefined)),
  platformId: nullableRelationId,
  deptId: nullableRelationId,
  shopId: nullableRelationId,
});

const userBaseSchema = z.object({
  username: z.string().trim().min(1, '用户名不能为空').max(50, '用户名不能超过 50 个字符'),
  phone: optionalTrimmedString,
  email: z
    .union([z.string().trim().email('邮箱格式不正确'), z.literal(''), z.undefined()])
    .transform((value) => (typeof value === 'string' && value.length > 0 ? value : undefined)),
  status: z.coerce.number().int().min(0).max(1).default(1),
  platformId: nullableRelationId,
  deptId: nullableRelationId,
  shopId: nullableRelationId,
  roleIds: z.array(z.string().trim().min(1)).default([]),
});

export const createUserSchema = userBaseSchema.extend({
  password: z
    .string()
    .min(6, '密码至少 6 位')
    .max(64, '密码不能超过 64 位'),
});

export const updateUserSchema = userBaseSchema.extend({
  password: z
    .union([z.string().min(6, '密码至少 6 位').max(64, '密码不能超过 64 位'), z.literal(''), z.undefined()])
    .transform((value) => (typeof value === 'string' && value.length > 0 ? value : undefined)),
});

export type UserListQuery = z.infer<typeof userListQuerySchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
