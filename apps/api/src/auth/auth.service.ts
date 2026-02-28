import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { google } from 'googleapis';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  private client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID);
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateGoogleToken(idToken: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid token');
      }
      return {
        userId: payload['sub'],
        email: payload['email'],
        name: payload['name'],
        picture: payload['picture'],
      };
    } catch (error) {
      console.error('Error validating Google token:', error);
      return null;
    }
  }

  async googleLogin(idToken: string) {
    const userData = await this.validateGoogleToken(idToken);
    if (!userData) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.usersService.createUser(userData.userId);

    const payload = {
      sub: user.id,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
