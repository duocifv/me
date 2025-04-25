import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { TokensService } from './tokens.service';
import { UnauthorizedException } from '@nestjs/common';
import { RefreshToken } from './entities/refresh-token.entity';

describe('TokensService - RefreshToken logic', () => {
  let service: TokensService;
  let jwtService: Partial<JwtService>;
  let rtRepo: Partial<Repository<RefreshToken>>;

  const mockUser = { id: 'user-id' } as any;
  const mockJti = 'test-jti';
  const now = Date.now();

  beforeEach(async () => {
    jwtService = {
      verify: jest.fn().mockReturnValue({ sub: mockUser.id, jti: mockJti }),
    };

    rtRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockResolvedValue(null),
      delete: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensService,
        { provide: JwtService, useValue: jwtService },
        { provide: getRepositoryToken(RefreshToken), useValue: rtRepo },
      ],
    }).compile();

    service = module.get<TokensService>(TokensService);
  });

  describe('verifyRefreshToken', () => {
    it('should return payload when token is valid', () => {
      const token = 'valid-token';
      const payload = service.verifyRefreshToken(token);
      expect(jwtService.verify).toHaveBeenCalledWith(token, expect.any(Object));
      expect(payload).toEqual({ sub: mockUser.id, jti: mockJti });
    });

    it('should throw UnauthorizedException when token invalid', () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error();
      });
      expect(() => service.verifyRefreshToken('bad-token')).toThrow(
        UnauthorizedException,
      );
    });
  });
});
