import { MongoClient } from "mongodb";

const options = {};
let client;
let clientPromise;
const username = process.env.DB_USER;
const password = process.env.DB_PASS;

const uri = `mongodb+srv://${username}:${password}@cluster0.nevhe4f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const uri = `mongodb://localhost:27017`

async function connectToDatabase() {
    try {
        if (process.env.NODE_ENV === 'development') {
            // In development mode, use a global variable so the client is not created multiple times.
            if (!global._mongoClientPromise) {
                client = new MongoClient(uri, options);
                global._mongoClientPromise = client.connect();
            }
            clientPromise = global._mongoClientPromise;
        } else {
            // In production mode, it's okay to create a new client every time.
            client = new MongoClient(uri, options);
            clientPromise = client.connect();
        }
        await clientPromise;
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        throw error;
    }
}

connectToDatabase();

export default clientPromise;



