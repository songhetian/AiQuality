import { AuthService } from './auth.service';
export declare const IS_PUBLIC_KEY = "isPublic";
export declare const Public: () => import("@nestjs/common").CustomDecorator<string>;
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: any): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            deptId: any;
            roles: any;
            permissions: unknown[];
        };
    }>;
}
