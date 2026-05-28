import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const PERMISSIONS_KEY = "permissions";

export const Auth = (permissions?: string[]) =>
  applyDecorators(
    SetMetadata(PERMISSIONS_KEY, permissions),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth("JWT-auth"),
    ApiUnauthorizedResponse({ description: "Unauthorized" }),
  );
