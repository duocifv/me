import { z } from 'zod';
export declare const LoginSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    username: string;
}, {
    password: string;
    username: string;
}>;
declare const LoginDto_base: import("nestjs-zod").ZodDto<{
    password: string;
    username: string;
}, z.ZodObjectDef<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny>, {
    password: string;
    username: string;
}>;
export declare class LoginDto extends LoginDto_base {
}
export {};
