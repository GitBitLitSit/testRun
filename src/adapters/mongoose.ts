import mongoose from "mongoose";

const DB_NAME = process.env.MONGODB_DB_NAME || "billiard-club";

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectToMongoose(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!connectionPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("Missing MONGODB_URI");
    }
    connectionPromise = mongoose.connect(uri, { dbName: DB_NAME });
  }

  await connectionPromise;
  return mongoose;
}
