const { MongoClient, GridFSBucket } = require("mongodb");

let client = null;
let db = null;
let bucket = null;

async function connect() {
  if (client && db) return { client, db, bucket };

  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB;
  if (!uri || !dbName) throw new Error("MONGO_URI or MONGO_DB not set");

  client = new MongoClient(uri, {
    // Fail fast if the server is unreachable
    serverSelectionTimeoutMS: 5000,
  });
  await client.connect();
  db = client.db(dbName);
  bucket = new GridFSBucket(db, { bucketName: "documents" });
  return { client, db, bucket };
}

function getBucket() {
  if (!bucket) throw new Error("MongoDB not connected, call connect() first");
  return bucket;
}

function getDb() {
  if (!db) throw new Error("MongoDB not connected, call connect() first");
  return db;
}

module.exports = { connect, getBucket, getDb };
