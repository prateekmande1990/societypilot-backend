import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter
  implements ExceptionFilter
{
  catch(
    exception: unknown,
    host: ArgumentsHost,
  ) {
    const ctx =
      host.switchToHttp();

    const response =
      ctx.getResponse<Response>();

    const request =
      ctx.getRequest<Request>();

    /*
     * IMPORTANT
     * Real terminal logging
     */
    console.error(
      'EXCEPTION =>',
      exception,
    );

    const isHttpException =
      exception instanceof HttpException;

    const status =
      isHttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      isHttpException
        ? exception.getResponse()
        : null;

    const message =
      typeof exceptionResponse ===
        'object' &&
      exceptionResponse !== null &&
      'message' in
        exceptionResponse
        ? (exceptionResponse.message as
            | string
            | string[])
        : isHttpException
          ? exception.message
          : 'Internal server error';

    response.status(status).json({
      success: false,
      error: {
        code: status,
        message,
        path: request.url,
      },
    });
  }
}