"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adapterFakeModeSchema = exports.adapterFakeDataSchema = exports.adapterCollectSchema = exports.adapterStatusSchema = exports.adapterUpsertSchema = exports.adapterMappingSchema = void 0;
const zod_1 = require("zod");
const nonEmptyString = (label) => zod_1.z.string().trim().min(1, `${label}不能为空`);
const nullableString = zod_1.z.string().trim().min(1).nullable().optional();
const jsonString = (label) => zod_1.z
    .string()
    .trim()
    .superRefine((value, ctx) => {
    if (!value) {
        return;
    }
    try {
        JSON.parse(value);
    }
    catch {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: `${label} 不是合法的 JSON`,
        });
    }
})
    .optional()
    .nullable();
exports.adapterMappingSchema = zod_1.z.object({
    thirdPartyFields: nonEmptyString('第三方字段'),
    systemFields: nonEmptyString('系统字段'),
    formatMapping: nullableString,
    remark: nullableString,
});
exports.adapterUpsertSchema = zod_1.z.object({
    name: nonEmptyString('接口名称'),
    type: nonEmptyString('接口类型'),
    url: zod_1.z.url('接口地址格式不正确'),
    method: zod_1.z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
    platformId: nonEmptyString('平台'),
    deptId: nullableString,
    headers: jsonString('Headers JSON'),
    authParams: jsonString('认证参数 JSON'),
    enableFakeData: zod_1.z.boolean().optional(),
    status: zod_1.z.union([zod_1.z.literal(0), zod_1.z.literal(1)]).optional(),
    mappings: zod_1.z.array(exports.adapterMappingSchema).default([]),
});
exports.adapterStatusSchema = zod_1.z.object({
    status: zod_1.z.union([zod_1.z.literal(0), zod_1.z.literal(1)]),
});
exports.adapterCollectSchema = zod_1.z
    .object({
    persist: zod_1.z.boolean().optional(),
})
    .optional();
exports.adapterFakeDataSchema = zod_1.z.object({
    data: zod_1.z.unknown(),
    scene: zod_1.z.string().trim().min(1).optional(),
});
exports.adapterFakeModeSchema = zod_1.z.object({
    enable: zod_1.z.boolean(),
});
//# sourceMappingURL=adapter.schemas.js.map