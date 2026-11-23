import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedRequest } from './jwt-auth.guard';

/** Id of the signed-in user. Only use on routes protected by `JwtAuthGuard`. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.id;
    if (!userId) {
      // Reaching this means the guard wasn't applied to the route.
      throw new UnauthorizedException('Not authenticated');
    }
    return userId;
  },
);
