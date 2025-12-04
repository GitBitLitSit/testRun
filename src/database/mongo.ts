import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToMongo(): Promise<Db> {
    if(db) return db;

    const uri = process.env.MONGODB_URI!;
    client = new MongoClient(uri);
    await client.connect();

    db = client.db(process.env.MONGODB_DB_NAME || "billiard-club");
    return db;
}