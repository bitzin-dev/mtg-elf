import { IAuthRepository } from "./auth.repository";
import { IDBService } from "../database/db.service";
import { MongoCollections, Profile } from "../../enums";
import { schemaRegisterType, schemaLoginType } from "./auth.repository";
import type { RequestResult } from "../../types";

export class AuthService implements IAuthRepository {

    private IDatabase : IDBService;

    constructor(database : IDBService){
        this.IDatabase = database;
    }

    async getUserByEmail(email: string) {
        const collection = this.IDatabase.GetDB().collection(MongoCollections.users);
        return await collection.findOne({ email });
    }

    async passwordHash(password: string): Promise<string> {
        return await Bun.password.hash(password, { algorithm: 'bcrypt', cost: 10 });
    }

    async create_session(email: string) {
        const uuid = crypto.randomUUID();
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);
        const collection = this.IDatabase.GetDB().collection(MongoCollections.sessions);
        const session = await collection.insertOne({ email, uuid, expires });
        if (!session) return { success: false, error: "Failed to create session" };
        return { success: true, authorization: uuid, expires };
    }
    
    async register(data: schemaRegisterType): Promise<RequestResult> {
    
        // Get user by email data
        const user = await this.getUserByEmail(data.email);
        if (user && user.name === data.name) return { success: false, error: "Username already exists" };
        if (user && user.email === data.email) return { success: false, error: "Email already exists" };
    
        // Gen hash salt password
        data.password = await this.passwordHash(data.password);
        data.avatarUrl = Profile.picture;
        data.joinDate = new Date();
    
        // Register user
        const collection = this.IDatabase.GetDB().collection(MongoCollections.users);
        const register = await collection.insertOne(data);
        if (!register) return { success: false, error: "Failed to register" };
    
        // Create session and return authorization to front-end
        const session = await this.create_session(data.email);
        if (!session) return { success: false, error: "Failed to create session" };
    
        return { success: true, authorization: session.authorization };
    
    }

    async login(data: schemaLoginType): Promise<RequestResult> {
    
        // Get user by email data
        const user = await this.getUserByEmail(data.email);
        if (!user) return { success: false, error: "User not found" };
    
        // Verify match password salt
        const isMatch = await Bun.password.verify(data.password, user.password);
        if (!isMatch) return { success: false, error: "Invalid password" };
    
        // Create session and return authorization to front-end
        const session = await this.create_session(data.email);
        if (!session) return { success: false, error: "Failed to create session" };
    
        return { success: true, authorization: session.authorization };

    }

    async isAuthenticated(authorization: string) : Promise<any> {
      const collection = this.IDatabase.GetDB().collection(MongoCollections.sessions);
      const session = await collection.findOne({ uuid: authorization });
      if (session && session.expires > new Date()) return session;
      return null;
    }

}