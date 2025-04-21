"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDto = exports.CreateUserDto = exports.UserSchema = exports.CreateUserSchema = void 0;
const nestjs_zod_1 = require("nestjs-zod");
const zod_1 = require("zod");
exports.CreateUserSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(32),
    password: zod_1.z.string().min(6).max(100),
});
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.number(),
    username: zod_1.z.string(),
    createdAt: zod_1.z.date(),
});
class CreateUserDto extends (0, nestjs_zod_1.createZodDto)(exports.CreateUserSchema) {
}
exports.CreateUserDto = CreateUserDto;
class UserDto extends (0, nestjs_zod_1.createZodDto)(exports.UserSchema) {
}
exports.UserDto = UserDto;
//# sourceMappingURL=user.dto.js.map