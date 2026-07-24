import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Request, Response } from "express";
import { ApiResponse } from "../constants/interface";
import { SKIP_TRANSFORM_KEY } from "../decorators/skip-transform.decorator";

interface WrappedResponse<T> {
  message?: string;
  data?: T;
  metadata?: unknown;
}

function isWrappedResponse<T>(data: unknown): data is WrappedResponse<T> {
  return (
    data !== null &&
    typeof data === "object" &&
    ("data" in data || "message" in data || "metadata" in data)
  );
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T> | T
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | T> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_TRANSFORM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skip) {
      return next.handle() as Observable<T>;
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data: T) => {
        const wrapped = isWrappedResponse<T>(data) ? data : null;

        return {
          success: true,
          statusCode: response.statusCode,
          message: wrapped?.message ?? "Success",
          data: wrapped?.data !== undefined ? wrapped.data : data,
          metadata: wrapped?.metadata,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
