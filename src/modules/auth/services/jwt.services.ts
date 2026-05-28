import { Injectable } from "@nestjs/common";
import { JwtService as JwtModule } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import configuration from "src/config/configuration";
import { JwtPayload } from "src/common/constants/interface";
import type { SignOptions } from "jsonwebtoken";

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwtModule: JwtModule) {}

  private readonly accessTokenExpiresIn: SignOptions["expiresIn"] =
    (configuration().jwt.expiresIn ?? "1d") as SignOptions["expiresIn"];

  private readonly refreshTokenExpiresIn: SignOptions["expiresIn"] =
    (configuration().jwt.expiresRefreshIn ?? "7d") as SignOptions["expiresIn"];

  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, configuration().jwt.saltRounds);
  }

  comparePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  generateAccessToken(payload: {
    sub: number;
    email: string;
  }): Promise<string> {
    return this.jwtModule.signAsync(payload, {
      secret: configuration().jwt.secret,
      expiresIn: this.accessTokenExpiresIn,
    });
  }
  generateRefreshToken(payload: { sub: number }): Promise<string> {
    return this.jwtModule.signAsync(payload, {
      secret: configuration().jwt.secret,
      expiresIn: this.refreshTokenExpiresIn,
    });
  }

  verifyToken(token: string): Promise<JwtPayload> {
    return this.jwtModule.verifyAsync(token, {
      secret: configuration().jwt.secret,
    });
  }
}
