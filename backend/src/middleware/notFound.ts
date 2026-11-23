import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new AppError(
    `Cannot find route ${req.method} ${req.originalUrl} on this server`,
    404,
    "ROUTE_NOT_FOUND",
  );
  next(error);
};
