import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EntityNotFoundError } from 'typeorm';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpException.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    let message = exception.message;

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();
      if (
        typeof response === 'object' &&
        'message' in response &&
        Array.isArray(response.message)
      ) {
        message = response.message.join(', ');
      }
    }

    if (exception instanceof EntityNotFoundError) {
      message = 'Resource not found';
    }

    this.logger.error(
      `Error occurred: ${message}  ip: ${(request.headers?.['cf-connecting-ip'] as string) ?? request.ip}`,
      exception.stack,
    );

    response.status(status).json({
      success: false,
      message: message, //exception instanceof BadRequestException,
      error: exception.name,
      details: {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }
}
