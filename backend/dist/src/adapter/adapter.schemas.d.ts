import { z } from 'zod';
export declare const adapterMappingSchema: z.ZodObject<{
    thirdPartyFields: z.ZodString;
    systemFields: z.ZodString;
    formatMapping: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    remark: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const adapterUpsertSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodString;
    url: z.ZodURL;
    method: z.ZodEnum<{
        PUT: "PUT";
        POST: "POST";
        DELETE: "DELETE";
        GET: "GET";
        PATCH: "PATCH";
    }>;
    platformId: z.ZodString;
    deptId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    headers: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    authParams: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    enableFakeData: z.ZodOptional<z.ZodBoolean>;
    status: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>]>>;
    mappings: z.ZodDefault<z.ZodArray<z.ZodObject<{
        thirdPartyFields: z.ZodString;
        systemFields: z.ZodString;
        formatMapping: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        remark: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const adapterStatusSchema: z.ZodObject<{
    status: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>]>;
}, z.core.$strip>;
export declare const adapterCollectSchema: z.ZodOptional<z.ZodObject<{
    persist: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>>;
export declare const adapterFakeDataSchema: z.ZodObject<{
    data: z.ZodUnknown;
    scene: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const adapterFakeModeSchema: z.ZodObject<{
    enable: z.ZodBoolean;
}, z.core.$strip>;
export type AdapterUpsertInput = z.infer<typeof adapterUpsertSchema>;
export type AdapterStatusInput = z.infer<typeof adapterStatusSchema>;
export type AdapterCollectInput = z.infer<typeof adapterCollectSchema>;
export type AdapterFakeDataInput = z.infer<typeof adapterFakeDataSchema>;
export type AdapterFakeModeInput = z.infer<typeof adapterFakeModeSchema>;
