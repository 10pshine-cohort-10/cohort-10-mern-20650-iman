import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../logger/index.js";

// Connection lifecycle event listeners
mongoose.connection.on("connected", () => {
  logger.info("MongoDB connection established successfully");
});

mongoose.connection.on("error", (err: Error) => {
  logger.error({ err }, `MongoDB connection error: ${err.message}`);
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB connection disconnected");
});

export const connectDB = async (): Promise<void> => {
  try {
    logger.info(`Connecting to MongoDB at: ${env.mongodbUri.replace(/:([^:@]+)@/, ":****@")}`);
    await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error({ err }, `Initial MongoDB connection failed: ${err.message}`);
    // We log and rethrow so server startup can decide how to handle or proceed
    throw err;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      logger.info("MongoDB disconnected gracefully");
    }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error({ err }, `Error during MongoDB disconnect: ${err.message}`);
  }
};

export type DatabaseStatus = "disconnected" | "connected" | "connecting" | "disconnecting";

export const getDBStatus = (): { status: DatabaseStatus; readyState: number } => {
  const states: Record<number, DatabaseStatus> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const state = mongoose.connection.readyState;
  return {
    status: states[state] || "disconnected",
    readyState: state,
  };
};
