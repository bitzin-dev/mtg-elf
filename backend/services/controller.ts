import MongoDB from "../database";
import { ObjectId, type Db } from "mongodb";
import { MongoCollections, Profile } from "./enums";
import { schemaRegister, schemaLogin, schemaCreateCollection, schemaSavedSearch, schemaDeleteCollection, schemaCardOperation, schemaDeleteSearch, schemaRenameCollection } from "./schemas";
import { MockUser, RequestResult, UserCollection } from "./types";
import { z } from "zod";

class Controller {

    private mongo: MongoDB;
    private db!: Db;

    constructor() {
        this.mongo = new MongoDB();
    }

    async setup(): Promise<void> {
        if (!this.db) this.db = await this.mongo.setup();
        console.log("Database connected");
    }

    GetDB(): Db {
        if (!this.db) {
            throw new Error("Database not connected");
        }
        return this.db;
    }

}

export default Controller;