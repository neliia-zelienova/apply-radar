import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedRequest, JwtAuthGuard } from './jwt-auth.guard';

const contextFor = (request: Partial<AuthenticatedRequest>) =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

describe('JwtAuthGuard', () => {
  let verifyAsync: jest.Mock;
  let guard: JwtAuthGuard;

  beforeEach(() => {
    verifyAsync = jest.fn();
    guard = new JwtAuthGuard({ verifyAsync } as unknown as JwtService);
  });

  it('rejects a request without an Authorization header', async () => {
    await expect(
      guard.canActivate(contextFor({ headers: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects a non-Bearer or empty token', async () => {
    for (const authorization of ['Basic abc', 'Bearer ', 'Bearer    ']) {
      await expect(
        guard.canActivate(contextFor({ headers: { authorization } })),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    }
  });

  it('rejects a token that fails verification', async () => {
    verifyAsync.mockRejectedValue(new Error('jwt expired'));
    await expect(
      guard.canActivate(
        contextFor({ headers: { authorization: 'Bearer bad' } }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects refresh tokens even when they verify', async () => {
    verifyAsync.mockResolvedValue({ sub: 'oauth-id', type: 'refresh' });
    await expect(
      guard.canActivate(
        contextFor({ headers: { authorization: 'Bearer refresh-token' } }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a token without a user id', async () => {
    verifyAsync.mockResolvedValue({ email: 'a@b.c' });
    await expect(
      guard.canActivate(contextFor({ headers: { authorization: 'Bearer t' } })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts a valid access token and sets request.user from sub', async () => {
    verifyAsync.mockResolvedValue({ sub: 'user-123', userId: 'legacy' });
    const request: Partial<AuthenticatedRequest> = {
      headers: { authorization: 'Bearer token-value' },
    };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(verifyAsync).toHaveBeenCalledWith('token-value');
    expect(request.user).toEqual({ id: 'user-123' });
  });
});
