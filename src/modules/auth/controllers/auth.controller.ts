import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Auth } from "src/common/decorators/auth.decorator";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import type { JwtPayload } from "src/common/constants/interface";
import {
  ChangePasswordDto,
  CreateUserDto,
  LoginDto,
} from "../constants/auth.dto";
import { LoginResponse, UserResponse } from "../constants/auth.response";
import { AuthService } from "../services/auth.services";

@Controller("auth")
@ApiTags("Auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() dto: CreateUserDto): Promise<UserResponse> {
    return await this.authService.createAccount(dto);
  }

  @Post("login")
  async login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return await this.authService.login(dto);
  }

  @Post("change-password")
  async changePassword(@Body() dto: ChangePasswordDto): Promise<UserResponse> {
    return await this.authService.changePassword(dto);
  }

  @Get("me")
  @Auth()
  me(@CurrentUser() user: JwtPayload): JwtPayload {
    return user;
  }
}
