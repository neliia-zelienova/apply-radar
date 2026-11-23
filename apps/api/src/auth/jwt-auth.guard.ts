import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
}

export type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

/**
 * Requires a valid access token (`Authorization: Bearer <jwt>`) and puts the
 * user id on `request.user`. Read it with the `@CurrentUser()` decorator.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing access token');
    }

    const token = authorization.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    let payload: { sub?: string; userId?: string; type?: string };
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }

    // Refresh tokens can share the access-token secret (when JWT_REFRESH_SECRET
    // isn't set) and carry the OAuth id as `sub`, so never accept them here.
    if (payload.type === 'refresh') {
      throw new UnauthorizedException('Invalid access token');
    }

    const userId = payload.sub ?? payload.userId;
    if (!userId) {
      throw new UnauthorizedException('Invalid access token');
    }

    request.user = { id: userId };
    return true;
  }
}
