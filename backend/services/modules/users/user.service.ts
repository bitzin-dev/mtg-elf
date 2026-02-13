import { IUserRepository, UserSchema } from "./user.repository";
import type { IDBService } from "../database/db.service";
import { MongoCollections } from "../../enums";

export class UserServices implements IUserRepository {

    private database : IDBService;

    constructor(database : IDBService){
        this.database = database;
    }

    async getUsers(): Promise<Array<UserSchema>> {
        return await this.database.GetDB().collection<UserSchema>(MongoCollections.users).find().toArray();
    }

}