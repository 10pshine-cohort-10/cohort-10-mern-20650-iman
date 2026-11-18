import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError } from "../utils/AppError.js";
import { logger } from "../logger/index.js";
import { env } from "../config/env.js";

interface MongooseCastError extends Error {
  name: "CastError";
  path: string;
  value: unknown;
}

interface MongooseDuplicateKeyError extends Error {
  code: 11000;
  keyValue?: Record<string, unknown>;
}

interface MongooseValidationError extends Error {
  name: "ValidationError";
  errors: Record<string, { message: string; path: string }>;
}

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let code = "INTERNAL_SERVER_ERROR";
  let message = "An unexpected error occurred. Please try again later.";
  let details: unknown = undefined;

  // Handle our custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  }
  // Mongoose CastError (invalid ObjectId)
  else if (err.name === "CastError") {
    const castErr = err as MongooseCastError;
    statusCode = 400;
    code = "INVALID_ID";
    message = `Invalid value for field '${castErr.path}': ${String(castErr.value)}`;
  }
  // Mongoose duplicate key error (E11000)
  else if ((err as unknown as MongooseDuplicateKeyError).code === 11000) {
    const dupErr = err as unknown as MongooseDuplicateKeyError;
    statusCode = 409;
    code = "DUPLICATE_KEY";
    const field = dupErr.keyValue ? Object.keys(dupErr.keyValue)[0] : "field";
    message = `A record with this ${field} already exists.`;
  }
  // Mongoose ValidationError
  else if (err.name === "ValidationError") {
    const valErr = err as MongooseValidationError;
    statusCode = 400;
    code = "VALIDATION_ERROR";
    const messages = Object.values(valErr.errors).map((e) => e.message);
    message = `Validation failed: ${messages.join(", ")}`;
    details = messages;
  }
  // JWT errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    code = "INVALID_TOKEN";
    message = "Invalid authentication token. Please log in again.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    code = "TOKEN_EXPIRED";
    message = "Authentication token expired. Please log in again.";
  }

  // Log error using Pino
  if (statusCode >= 500) {
    logger.error(
      {
        err,
        method: req.method,
        url: req.originalUrl,
        requestId: req.id,
      },
      `Unhandled Exception: ${err.message}`,
    );
  } else {
    logger.warn(
      {
        code,
        message,
        method: req.method,
        url: req.originalUrl,
        requestId: req.id,
      },
      `Operational Error [${statusCode}]: ${message}`,
    );
  }

  // Response payload
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
      ...(env.nodeEnv !== "production" && { stack: err.stack }),
    },
  });
};
