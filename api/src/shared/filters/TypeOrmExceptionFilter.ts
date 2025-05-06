import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { QueryFailedError } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { CannotCreateEntityIdMapError } from 'typeorm/error/CannotCreateEntityIdMapError';
import { ColumnTypeUndefinedError } from 'typeorm/error/ColumnTypeUndefinedError';
import { ConnectionIsNotSetError } from 'typeorm/error/ConnectionIsNotSetError';
import { CannotExecuteNotConnectedError } from 'typeorm/error/CannotExecuteNotConnectedError';
import { QueryRunnerAlreadyReleasedError } from 'typeorm/error/QueryRunnerAlreadyReleasedError';
import { CircularRelationsError } from 'typeorm/error/CircularRelationsError';
import { CannotAttachTreeChildrenEntityError } from 'typeorm/error/CannotAttachTreeChildrenEntityError';

@Catch(
  QueryFailedError,
  EntityNotFoundError,
  CannotCreateEntityIdMapError,
  ColumnTypeUndefinedError,
  ConnectionIsNotSetError,
  CannotExecuteNotConnectedError,
  QueryRunnerAlreadyReleasedError,
  CircularRelationsError,
  CannotAttachTreeChildrenEntityError,
)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Log chi tiết lỗi ra console
    Logger.error(
      (exception as any).message,
      (exception as any).stack,
      `${request.method} ${request.url}`,
    );

    // Phân loại exception theo class
    switch ((exception as any).constructor) {
      case QueryFailedError:
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        message = (exception as QueryFailedError).message;
        break;
      case EntityNotFoundError:
        status = HttpStatus.NOT_FOUND;
        message = 'Resource not found';
        break;
      case CannotCreateEntityIdMapError:
      case ColumnTypeUndefinedError:
        status = HttpStatus.BAD_REQUEST;
        message = (exception as any).message;
        break;
      case ConnectionIsNotSetError:
      case CannotExecuteNotConnectedError:
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = (exception as any).message;
        break;
      case QueryRunnerAlreadyReleasedError:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Query runner already released';
        break;
      case CircularRelationsError:
      case CannotAttachTreeChildrenEntityError:
        status = HttpStatus.BAD_REQUEST;
        message = (exception as any).message;
        break;
      default:
        break;
    }

    response.status(status).send({ statusCode: status, message });
  }
}
