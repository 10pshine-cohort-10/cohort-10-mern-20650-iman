import pino from "pino";
import { env } from "../config/env.js";

const isDev = env.nodeEnv === "development";

export const logger = pino({
  level: env.logLevel,
  redact: {
    paths: [
      "req.headers.cookie",
      "req.headers.authorization",
      "headers.cookie",
      "headers.authorization",
      "password",
      "*.password",
      "passwordHash",
      "*.passwordHash",
    ],
    remove: true,
  },
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});
