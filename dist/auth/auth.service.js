"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const tokens_service_1 = require("./tokens.service");
const users_service_1 = require("../user/users.service");
let AuthService = class AuthService {
    usersService;
    tokensService;
    constructor(usersService, tokensService) {
        this.usersService = usersService;
        this.tokensService = tokensService;
    }
    async signIn(dto, res) {
        const user = await this.usersService.validateUser(dto.email, dto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Email hoặc mật khẩu không đúng');
        }
        const { accessToken, refreshToken, expiresAt } = await this.tokensService.generateTokenPair(user);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: expiresAt.getTime() - Date.now(),
        });
        return { accessToken };
    }
    async refreshTokens(req, res) {
        const token = req.cookies['refreshToken'];
        if (!token) {
            throw new common_1.UnauthorizedException('Không tìm thấy refresh token');
        }
        const payload = this.tokensService.verifyRefreshToken(token);
        const user = await this.usersService.findById(payload.sub);
        if (!user) {
            throw new common_1.UnauthorizedException('Người dùng không tồn tại');
        }
        const { accessToken, refreshToken: newRefreshToken, expiresAt, } = await this.tokensService.rotateRefreshToken(payload.jti, user);
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: expiresAt.getTime() - Date.now(),
        });
        return { accessToken };
    }
    async logout(req, res) {
        const token = req.cookies['refreshToken'];
        if (token) {
            await this.tokensService.revokeRefreshToken(token);
        }
        res.clearCookie('refreshToken', { path: '/' });
        return { message: 'Đăng xuất thành công' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        tokens_service_1.TokensService])
], AuthService);
//# sourceMappingURL=auth.service.js.map