import { JwtAuthService } from "@modules/auth/services/jwt.services";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { ErrorMessage } from "../constants/err";
import { IS_PUBLIC_KEY, PERMISSIONS_KEY } from "../decorators/auth.decorator";
import { JwtPayload } from "../constants/interface";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(ErrorMessage.TOKEN_NOT_FOUND);
    }

    try {
      const payload = await this.jwtAuthService.verifyToken(token);
      request["user"] = payload;
    } catch {
      throw new UnauthorizedException(ErrorMessage.TOKEN_NOT_VALID);
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredPermissions && requiredPermissions.length > 0) {
      const user = request["user"] as JwtPayload;
      if (!user.isSuperAdmin) {
        const userPermissions = (user.permissions ?? []).map((p) => p.code);
        const hasPermission = requiredPermissions.some((reqPerm) =>
          userPermissions.includes(reqPerm),
        );

        if (!hasPermission) {
          throw new UnauthorizedException(ErrorMessage.FORBIDDEN);
        }
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : null;
  }
}
