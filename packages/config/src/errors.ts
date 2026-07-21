import { AppError } from '@lade/shared';

export interface SerializedError {
  code: string;
  message: string;
  statusCode: number;
  details?: unknown[];
  requestId?: string;
}

export function serializeError(error: unknown, requestId?: string): SerializedError {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      requestId,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      statusCode: 500,
      requestId,
    };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    statusCode: 500,
    requestId,
  };
}

export function handleApiError(error: unknown, requestId?: string): Response {
  const serialized = serializeError(error, requestId);

  return Response.json(
    {
      status: 'error',
      error: serialized,
    },
    { status: serialized.statusCode }
  );
}
