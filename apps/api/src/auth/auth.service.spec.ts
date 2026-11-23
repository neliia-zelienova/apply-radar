import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: { sign: jest.fn(), verifyAsync: jest.fn() } },
        { provide: UsersService, useValue: { createUser: jest.fn(), findUserByOauthId: jest.fn() } },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GOOGLE_CLIENT_ID') return 'test-google-client-id';
              if (key === 'JWT_SECRET') return 'test-jwt-secret';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assertCsrfHeader (refresh, logout)', () => {
    const req = (headers: Record<string, string>) =>
      ({ headers }) as unknown as Request;

    it('accepts the header the apps send', () => {
      expect(() =>
        service.assertCsrfHeader(req({ 'x-ar-ext': '1' })),
      ).not.toThrow();
    });

    it('rejects a request without it (e.g. a cross-site form POST)', () => {
      expect(() => service.assertCsrfHeader(req({}))).toThrow(
        UnauthorizedException,
      );
    });
  });
});
