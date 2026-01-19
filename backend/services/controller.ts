import MongoDB from "../database";
import { ObjectId, type Db } from "mongodb";
import { MongoCollections, Profile } from "./enums";
import { schemaRegister, schemaLogin, schemaCreateCollection, schemaSavedSearch, schemaDeleteCollection, schemaCardOperation, schemaDeleteSearch } from "./schemas";
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

    async getUserByEmail(email: string) {
        const collection = this.GetDB().collection(MongoCollections.users);
        return await collection.findOne({ email });
    }

    async passwordHash(password: string): Promise<string> {
        return await Bun.password.hash(password, { algorithm: 'bcrypt', cost: 10 });
    }

    async isAuthenticated(authorization: string) {
        const collection = this.GetDB().collection(MongoCollections.sessions);
        const session = await collection.findOne({ uuid: authorization });
        if (session && session.expires > new Date()) return session;
        return null;
    }

    async createSearch(data: z.infer<typeof schemaSavedSearch>, auth: string) {

        const getMe = await this.GetMe(auth);
        if (!getMe.success)
            return { success: false, error: "User not found" };

        data.email_user = getMe.email;
        data.timestamp = Date.now();

        const collection = this.GetDB().collection(MongoCollections.searches);
        const create = await collection.insertOne(data);

        if (!create) return { success: false, error: "Failed to create search" };
        return { success: true, uuid: create.insertedId };

    }

    async getSearches(auth: string) {

        const getMe = await this.GetMe(auth);
        if (!getMe.success)
            return { success: false, error: "User not found" };

        const collection = this.GetDB().collection(MongoCollections.searches);
        const searches = await collection.find({ email_user: getMe.email }).toArray();

        if (!searches) return { success: false, error: "Failed to get searches" };
        return { success: true, searches };

    }

    async deleteSearch(data: z.infer<typeof schemaDeleteSearch>, auth: string) {

        const getMe = await this.GetMe(auth);
        if (!getMe.success)
            return { success: false, error: "User not found" };

        const collection = this.GetDB().collection(MongoCollections.searches);

        const search = await collection.findOne({ _id: new ObjectId(data.searchId) });

        if (!search)
            return { success: false, error: "Search not found" };

        if (search.email_user !== getMe.email)
            return { success: false, error: "Unauthorized" };

        const deleteSearch = await collection?.deleteOne({ _id: new ObjectId(data.searchId) });

        if (!deleteSearch)
            return { success: false, error: "Failed to delete search" };

        return { success: true };

    }

    async deleteCollection(data: z.infer<typeof schemaDeleteCollection>, auth: string) {

        const getMe = await this.GetMe(auth);
        if (!getMe.success)
            return { success: false, error: "User not found" };

        const collection = this.GetDB().collection(MongoCollections.collections);

        const collectionData = await collection.findOne<UserCollection>(
            { _id: new ObjectId(data.collectionId) }
        );

        if (!collectionData)
            return { success: false, error: "Collection not found" };

        if (collectionData.email_user !== getMe.email) {
            return { success: false, error: "Unauthorized" };
        }

        const deleteCollection = await collection?.deleteOne({ _id: new ObjectId(data.collectionId) });

        if (!deleteCollection)
            return { success: false, error: "Failed to delete collection" };

        return { success: true };

    }

    async updateCollection(data: z.infer<typeof schemaCardOperation>, auth: string) {

        const getMe = await this.GetMe(auth);
        if (!getMe.success)
            return { success: false, error: "User not found" };

        const collection = this.GetDB().collection<UserCollection>(MongoCollections.collections);
        const collectionData = await collection.findOne<UserCollection>(
            { _id: new ObjectId(data.collectionId) }
        );

        if (!collectionData)
            return { success: false, error: "Collection not found" };

        if (collectionData.email_user !== getMe.email) {
            return { success: false, error: "Unauthorized" };
        }

        // Intialize quantites and ownedCardIds if they don't exist
        if (!collectionData.quantities) collectionData.quantities = {};
        if (!collectionData.ownedCardIds) collectionData.ownedCardIds = [];
        if (!collectionData.buyListIds) collectionData.buyListIds = [];
        if (!collectionData.printListIds) collectionData.printListIds = [];

        // Add card to collection
        if (data.action === "add") {
            if (collectionData.ownedCardIds.includes(data.cardId)) {
                await collection.updateOne(
                    { _id: new ObjectId(data.collectionId) },
                    { $inc: { [`quantities.${data.cardId}`]: data.quantity } }
                );
            }
            else {
                await collection.updateOne(
                    { _id: new ObjectId(data.collectionId) },
                    { $push: { ownedCardIds: data.cardId } }
                );
                await collection.updateOne(
                    { _id: new ObjectId(data.collectionId) },
                    { $set: { [`quantities.${data.cardId}`]: data.quantity } }
                );
            }
        }

        // Add to buy list
        if (data.action === 'addToBuy') {
            if (!collectionData.buyListIds.includes(data.cardId)) {
                await collection.updateOne(
                    { _id: new ObjectId(data.collectionId) },
                    { $push: { buyListIds: data.cardId } }
                );
            }
        }

        // Remove from buy list
        if (data.action === 'removeFromBuy') {
            await collection.updateOne(
                { _id: new ObjectId(data.collectionId) },
                { $pull: { buyListIds: { $eq: data.cardId } } }
            );
        }

        // Add to print list
        if (data.action === 'addToPrint') {
            if (!collectionData.printListIds.includes(data.cardId)) {
                await collection.updateOne(
                    { _id: new ObjectId(data.collectionId) },
                    { $push: { printListIds: data.cardId } }
                );
            }
        }

        // Remove from print list
        if (data.action === 'removeFromPrint') {
            await collection.updateOne(
                { _id: new ObjectId(data.collectionId) },
                { $pull: { printListIds: { $eq: data.cardId } } }
            );
        }

        // Remove card from collection
        if (data.action === 'remove') {
            await collection.updateOne(
                { _id: new ObjectId(data.collectionId) },
                { $pull: { ownedCardIds: { $eq: data.cardId } } }
            );
        }

        // Update card quantity
        if (data.action === 'update') {
            await collection.updateOne(
                { _id: new ObjectId(data.collectionId) },
                { $set: { [`quantities.${data.cardId}`]: data.quantity } }
            );
        }

        return { success: true };

    }

    async MeCollections(auth: string) {

        const getMe = await this.GetMe(auth);
        if (!getMe.success)
            return { success: false, error: "User not found" };

        // Get collections
        const collection = this.GetDB().collection(MongoCollections.collections);
        const all = await collection.find({ email_user: getMe.email }).toArray();

        if (!all)
            return { success: false, error: "Collections not found" };

        return { success: true, collections: all };

    }

    async createCollection(data: z.infer<typeof schemaCreateCollection>, auth: string) {

        // Get user
        const getMe = await this.GetMe(auth);

        if (!getMe.success)
            return { success: false, error: "User not found", uuid: null };

        data.email_user = getMe.email;
        data.createdAt = new Date();
        data.updatedAt = new Date();
        data.ownedCardIds = [];
        data.quantities = {};
        data.buyListIds = [];
        data.printListIds = [];

        const collection = this.GetDB().collection(MongoCollections.collections);
        const create = await collection.insertOne(data);

        if (!create) return { success: false, error: "Failed to create collection", uuid: null };
        return { success: true, uuid: create.insertedId };

    }

    async create_session(email: string) {
        const uuid = crypto.randomUUID();
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);
        const collection = this.GetDB().collection(MongoCollections.sessions);
        const session = await collection.insertOne({ email, uuid, expires });
        if (!session) return { success: false, error: "Failed to create session" };
        return { success: true, authorization: uuid, expires };
    }

    async register(data: z.infer<typeof schemaRegister>): Promise<RequestResult> {

        // Get user by email data
        const user = await this.getUserByEmail(data.email);
        if (user && user.name === data.name) return { success: false, error: "Username already exists" };
        if (user && user.email === data.email) return { success: false, error: "Email already exists" };

        // Gen hash salt password
        data.password = await this.passwordHash(data.password);
        data.avatarUrl = Profile.picture;
        data.joinDate = new Date();

        // Register user
        const collection = this.GetDB().collection(MongoCollections.users);
        const register = await collection.insertOne(data);
        if (!register) return { success: false, error: "Failed to register" };

        // Create session and return authorization to front-end
        const session = await this.create_session(data.email);
        if (!session) return { success: false, error: "Failed to create session" };

        return { success: true, authorization: session.authorization };

    }

    async login(data: z.infer<typeof schemaLogin>): Promise<RequestResult> {

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

    async GetMe(authorization: string): Promise<MockUser> {

        const session = await this.isAuthenticated(authorization);
        if (!session) return { success: false, error: "Session not found" };

        const user = await this.getUserByEmail(session.email);
        if (!user) return { success: false, error: "User not found" };

        return {
            success: true,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            joinDate: user.joinDate
        };

    }

}

export default Controller;