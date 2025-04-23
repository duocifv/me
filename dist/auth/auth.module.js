"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const throttler_1 = require("@nestjs/throttler");
const typeorm_1 = require("@nestjs/typeorm");
const auth_service_1 = require("./auth.service");
const tokens_service_1 = require("./tokens.service");
const refresh_token_entity_1 = require("./entities/refresh-token.entity");
const access_jwt_strategy_1 = require("./strategies/access-jwt.strategy");
const refresh_jwt_strategy_1 = require("./strategies/refresh-jwt.strategy");
const auth_controller_1 = require("./auth.controller");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([refresh_token_entity_1.RefreshToken]),
            jwt_1.JwtModule.register({ secret: process.env.JWT_ACCESS_SECRET, signOptions: { expiresIn: '15m' } }),
            throttler_1.ThrottlerModule.forRoot({ ttl: 60, limit: 5 }),
        ],
        providers: [auth_service_1.AuthService, tokens_service_1.TokensService, access_jwt_strategy_1.AccessJwtStrategy, refresh_jwt_strategy_1.RefreshJwtStrategy],
        controllers: [auth_controller_1.AuthController],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map