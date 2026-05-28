import { Module } from "@nestjs/common";
import { AuthService } from "./services/auth.services";
import { JwtAuthService } from "./services/jwt.services";
import { JwtModule } from "@nestjs/jwt";
import configuration from "src/config/configuration";
import { AuthController } from "./controllers/auth.controller";
import type { SignOptions } from "jsonwebtoken";

const config = configuration();
const jwtExpiresIn = (config.jwt.expiresIn ?? "1d") as SignOptions["expiresIn"];

@Module({
  imports: [
    JwtModule.register({
      secret: config.jwt.secret,
      signOptions: { expiresIn: jwtExpiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthService],
  exports: [AuthService, JwtAuthService],
})
export class AuthModule {}
