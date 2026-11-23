import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request } from 'express';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  async googleAuth(@Body('idToken') idToken: string, @Res() res: Response) {
    const result = await this.authService.googleLogin(idToken);
    res.setHeader('Set-Cookie', result.refresh_cookie);
    return res.json({ access_token: result.access_token });
  }

  /** Clears the refresh cookie so the session can't be restored after sign-out. */
  @Post('logout')
  @HttpCode(200)
  logout(@Req() req: Request, @Res() res: Response) {
    // Otherwise any site could sign the user out with a cross-site form POST.
    this.authService.assertCsrfHeader(req);
    res.setHeader('Set-Cookie', this.authService.buildClearedRefreshCookie());
    return res.json({ ok: true });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.refresh(req);

    if ((result as any).refresh_cookie) {
      res.setHeader('Set-Cookie', (result as any).refresh_cookie);
    }

    return res.json({ access_token: result.access_token });
  }
}
