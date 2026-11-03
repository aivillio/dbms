import { MongoClient, Db } from 'mongodb';

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_campus_nosql';

// Short timeout so app doesn't hang if MongoDB is offline
const options = {
  serverSelectionTimeoutMS: 2000,
  connectTimeoutMS: 2000,
  socketTimeoutMS: 2000,
};

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getMongoDb(): Promise<Db | null> {
  try {
    const connectedClient = await clientPromise;
    return connectedClient.db('smart_campus_nosql');
  } catch {
    // MongoDB not available - app continues with MySQL fallback
    return null;
  }
}

export default clientPromise;
