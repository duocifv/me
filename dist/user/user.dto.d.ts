import { z } from 'zod';
export declare const CreateUserSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodNumber;
    username: z.ZodString;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: number;
    username: string;
    createdAt: Date;
}, {
    id: number;
    username: string;
    createdAt: Date;
}>;
declare const CreateUserDto_base: import("nestjs-zod").ZodDto<{
    username: string;
    password: string;
}, z.ZodObjectDef<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny>, {
    username: string;
    password: string;
}>;
export declare class CreateUserDto extends CreateUserDto_base {
}
declare const UserDto_base: import("nestjs-zod").ZodDto<{
    id: number;
    username: string;
    createdAt: Date;
}, z.ZodObjectDef<{
    id: z.ZodNumber;
    username: z.ZodString;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny>, {
    id: number;
    username: string;
    createdAt: Date;
}>;
export declare class UserDto extends UserDto_base {
}
export {};
