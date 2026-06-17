import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { AppError } from '../errors/AppError.js';
import { logger } from '../logging/logger.js';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const correlationId = req.id;

  if (err instanceof ZodError) {
    logger.warn({ correlationId, err: err.flatten() }, 'Validation error');
    res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        correlationId,
        details: err.flatten(),
      },
    });
    return;
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ correlationId, err }, err.message);
    } else {
      logger.warn({ correlationId, code: err.code }, err.message);
    }
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.isOperational ? err.message : 'Something went wrong',
        correlationId,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  logger.error({ correlationId, err }, 'Unhandled error');
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong',
      correlationId,
    },
  });
};
