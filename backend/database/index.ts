import { MongoClient, Db } from "mongodb";

const client = new MongoClient(
    Bun.env.MONGODB_URI || "mongodb://localhost:27017"
);

class MongoDB {

    private database : Db;
    private client : MongoClient;

    constructor(){
        this.database = client.db("mtg");
        this.client = client;
    }

    async setup() : Promise<Db>{
        const connect = await this.client.connect();
        if (!connect) throw new Error("Failed to connect to database");
        this.database = this.client.db("mtg");
        return this.database;
    }

}

export default MongoDB;