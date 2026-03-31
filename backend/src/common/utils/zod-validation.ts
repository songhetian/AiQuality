import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

const formatIssuePath = (path: PropertyKey[]) => {
  if (path.length === 0) {
    return '';
  }

  return `${path.join('.')} `;
};

export const parseWithZod = <T>(
  schema: z.ZodType<T>,
  payload: unknown,
): T => {
  const result = schema.safeParse(payload);

  if (result.success) {
    return result.data;
  }

  const message = result.error.issues
    .map((issue) => `${formatIssuePath(issue.path)}${issue.message}`.trim())
    .join('; ');

  throw new BadRequestException(message || '请求参数校验失败');
};
