import { randomUUID } from "node:crypto";
import { pinoHttp } from "pino-http";
import type { Request, Response } from "express";
import { logger } from "../logger/index.js";

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req: Request) => {
    const existingId = req.headers["x-request-id"];
    if (typeof existingId === "string" && existingId.trim() !== "") {
      return existingId;
    }
    return randomUUID();
  },
  customLogLevel: (_req: Request, res: Response, err?: Error) => {
    if (res.statusCode >= 500 || err) {
      return "error";
    }
    if (res.statusCode >= 400) {
      return "warn";
    }
    return "info";
  },
  customSuccessMessage: (req: Request, res: Response) => {
    return `${req.method} ${req.url} completed with status ${res.statusCode}`;
  },
  customErrorMessage: (req: Request, res: Response, err: Error) => {
    return `${req.method} ${req.url} failed with status ${res.statusCode}: ${err.message}`;
  },
});
