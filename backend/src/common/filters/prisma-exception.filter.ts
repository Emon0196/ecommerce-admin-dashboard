import { ArgumentsHost, Catch, ConflictException, HttpStatus, NotFoundException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      // P2002: Unique constraint failed (e.g., duplicate slug or email) -> 409 Conflict
      case 'P2002': {
        const target = (exception.meta?.target as string[])?.join(', ') || 'field';
        response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: `Conflict error: A record with this ${target} already exists.`,
          error: 'Conflict',
        });
        break;
      }
      // P2025: Record to update/delete not found -> 404 Not Found
      case 'P2025': {
        response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'The requested record was not found.',
          error: 'Not Found',
        });
        break;
      }
      default:
        // Fall back to default handling for other unexpected database errors
        super.catch(exception, host);
        break;
    }
  }
}