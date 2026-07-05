import { NextResponse } from 'next/server';
import { AppError, ValidationError } from './errors';
import { Prisma } from '@safegrow/db';
import { ZodError } from 'zod';

type ApiHandler = (request: Request, context: any) => Promise<NextResponse> | NextResponse;

export function withErrorHandler(handler: ApiHandler) {
  return async (request: Request, context: any) => {
    try {
      return await handler(request, context);
    } catch (error: any) {
      console.error('API Error:', error);

      // Handle custom AppErrors
      if (error instanceof AppError) {
        return NextResponse.json(
          {
            error: error.message,
            ...(error instanceof ValidationError && error.details ? { details: error.details } : {}),
          },
          { status: error.statusCode }
        );
      }

      // Handle Zod Validation Errors
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: error.errors,
          },
          { status: 400 }
        );
      }

      // Handle Prisma Errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return NextResponse.json(
            { error: 'A record with this value already exists.' },
            { status: 409 }
          );
        }
        if (error.code === 'P2025') {
          return NextResponse.json(
            { error: 'Record not found.' },
            { status: 404 }
          );
        }
        return NextResponse.json(
          { error: `Database error: ${error.message}` },
          { status: 400 }
        );
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        return NextResponse.json(
          { error: 'Invalid data provided to database.' },
          { status: 400 }
        );
      }

      // Fallback for unexpected errors
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}
