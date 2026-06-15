// src/common/filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ApiResponse } from "../constants/interface";

interface HttpExceptionBody {
  message?: string | string[];
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!(exception instanceof HttpException)) {
      console.error("[API Error]", request.method, request.url, exception);
    }

    const exceptionResponse: string | HttpExceptionBody =
      exception instanceof HttpException
        ? exception.getResponse()
        : "Internal server error";

    const message =
      typeof exceptionResponse === "string"
        ? exceptionResponse
        : (exceptionResponse.message ?? "Something went wrong");

    const errors =
      typeof exceptionResponse === "object" &&
      Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message
        : undefined;

    const body: ApiResponse = {
      success: false,
      statusCode: status,
      message: Array.isArray(message) ? "Validation failed" : message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(body);
  }
}
