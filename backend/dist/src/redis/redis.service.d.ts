import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private client;
    private readonly logger;
    private readonly inFlight;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T>;
    delByPattern(pattern: string): Promise<number>;
    acquireLock(key: string, ttl?: number): Promise<boolean>;
    releaseLock(key: string): Promise<number>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttl?: number): Promise<'OK'>;
    del(key: string): Promise<number>;
    incr(key: string): Promise<number>;
    expire(key: string, ttl: number): Promise<number>;
    setJson(key: string, value: unknown, ttl?: number): Promise<'OK'>;
    getJson<T>(key: string): Promise<T | null>;
    tryLockReview(sessionId: string, userId: string, username: string): Promise<{
        success: boolean;
        owner?: string;
    }>;
    unlockReview(sessionId: string, userId: string): Promise<void>;
    private withJitter;
}
