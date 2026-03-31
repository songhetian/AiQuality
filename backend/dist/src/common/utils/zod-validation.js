"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseWithZod = void 0;
const common_1 = require("@nestjs/common");
const formatIssuePath = (path) => {
    if (path.length === 0) {
        return '';
    }
    return `${path.join('.')} `;
};
const parseWithZod = (schema, payload) => {
    const result = schema.safeParse(payload);
    if (result.success) {
        return result.data;
    }
    const message = result.error.issues
        .map((issue) => `${formatIssuePath(issue.path)}${issue.message}`.trim())
        .join('; ');
    throw new common_1.BadRequestException(message || '请求参数校验失败');
};
exports.parseWithZod = parseWithZod;
//# sourceMappingURL=zod-validation.js.map