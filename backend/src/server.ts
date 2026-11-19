import type { Server } from "node:http";
import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./logger/index.js";
import { connectDB, disconnectDB } from "./config/db.js";

let server: Server;

const startServer = async (): Promise<void> => {
  try {
    // Attempt MongoDB connection
    try {
      await connectDB();
    } catch (dbError: unknown) {
      const err = dbError instanceof Error ? dbError : new Error(String(dbError));
      logger.warn(
        `MongoDB could not connect immediately: ${err.message}. Server will continue running and health check will report DB status.`,
      );
    }

    server = app.listen(env.port, () => {
      logger.info(
        `🚀 Server started on port ${env.port} in [${env.nodeEnv}] mode. Health check at http://localhost:${env.port}/api/health`,
      );
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.fatal({ err }, `Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

void startServer();

// Process-level uncaught exception handler
process.on("uncaughtException", async (err: Error) => {
  logger.fatal({ err }, `Uncaught Exception thrown: ${err.message}. Shutting down...`);
  await disconnectDB();
  process.exit(1);
});

// Process-level unhandled promise rejection handler
process.on("unhandledRejection", async (reason: unknown) => {
  logger.fatal(
    { reason },
    `Unhandled Promise Rejection: ${reason instanceof Error ? reason.message : String(reason)}. Shutting down...`,
  );
  if (server) {
    server.close(async () => {
      await disconnectDB();
      process.exit(1);
    });
  } else {
    await disconnectDB();
    process.exit(1);
  }
});

// Graceful shutdown on termination signals
const handleGracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}. Gracefully closing HTTP server and database connection...`);
  if (server) {
    server.close(async () => {
      logger.info("HTTP server closed.");
      await disconnectDB();
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }

  // Force shutdown if connections do not close in time
  setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => void handleGracefulShutdown("SIGTERM"));
process.on("SIGINT", () => void handleGracefulShutdown("SIGINT"));
