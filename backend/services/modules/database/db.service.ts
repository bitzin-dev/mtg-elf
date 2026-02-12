import MongoDB from "../../../database";
import type { Db } from "mongodb";

// Using Singleton service MongoDB
export class IDBService {

    private static instance : IDBService;
    private mongo: MongoDB;
    private db! : Db;

    private constructor() {
        this.mongo = new MongoDB();
    }

    async setup(): Promise<void> {
        if (!this.db){
            this.db = await this.mongo.setup();
            console.log("Database connected");   
        }
    }

    public GetDB() : Db {
        return this.db;
    }

    public static GetInstance() {
        if (!IDBService.instance){
            IDBService.instance = new IDBService();
        }
        return IDBService.instance;
    }

}