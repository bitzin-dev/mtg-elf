import { MongoCollections } from "../../enums";
import { schemaSavedSearch, schemaDeleteSearch, schemaDeleteCollection, 
    schemaCardOperation, schemaCreateCollection, schemaRenameCollection } from "../../schemas";
import { UserCollection, MockUser } from "../../types";
import { AuthService } from "../auth/auth.service";
import { ObjectId } from "mongodb";
import type { IDBService } from "../database/db.service";
import z from "zod";

export default class MTG {

    private database : IDBService;
    private auth : AuthService;

    constructor(database : IDBService){
        this.database = database;
        this.auth = new AuthService(this.database);
    }

    async createSearch(data: z.infer<typeof schemaSavedSearch>, auth: string) {

        const getMe = await this.GetMe(auth);
        if (!getMe.success)
            return { success: false, error: "User not found" };

        data.email_user = getMe.email;
        data.timestamp = Date.now();

        const collection = this.database.GetDB().collection(MongoCollections.searches);
        const create = await collection.insertOne(data);

        if (!create) return { success: false, error: "Failed to create search" };
        return { success: true, uuid: create.insertedId };

    }

    async getSearches(auth: string) {

        const getMe = await this.GetMe(auth);
        if (!getMe.success)
            return { success: false, error: "User not found" };

        const collection = this.database.GetDB().collection(MongoCollections.searches);
        const searches = await collection.find({ email_user: getMe.email }).toArray();

        if (!searches) return { success: false, error: "Failed to get searches" };
        return { success: true, searches };

    }

    async deleteSearch(data: z.infer<typeof schemaDeleteSearch>, auth: string) {

        const getMe = await this.GetMe(auth);
        if (!getMe.success)
            return { success: false, error: "User not found" };

        const collection = this.database.GetDB().collection(MongoCollections.searches);

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

        const collection = this.database.GetDB().collection(MongoCollections.collections);

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

        const collection = this.database.GetDB().collection<UserCollection>(MongoCollections.collections);
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
        const collection = this.database.GetDB().collection(MongoCollections.collections);
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

        const collection = this.database.GetDB().collection(MongoCollections.collections);
        const create = await collection.insertOne(data);

        if (!create) return { success: false, error: "Failed to create collection", uuid: null };
        return { success: true, uuid: create.insertedId };

    }

    async renameCollection(data: z.infer<typeof schemaRenameCollection>, auth: string) {
        const getMe = await this.GetMe(auth);
        if (!getMe.success) return { success: false, error: "User not found" };

        const collection = this.database.GetDB().collection(MongoCollections.collections);
        const target = await collection.findOne({ _id: new ObjectId(data.collectionId) });

        if (!target) return { success: false, error: "Collection not found" };
        if (target.email_user !== getMe.email) return { success: false, error: "Unauthorized" };

        const update = await collection.updateOne(
            { _id: new ObjectId(data.collectionId) },
            { $set: { name: data.newName, updatedAt: new Date() } }
        );

        if (!update.modifiedCount) return { success: false, error: "Failed to rename (or name unchanged)" };
        return { success: true };
    }

    async GetMe(authorization: string): Promise<MockUser> {

        const session = await this.auth.isAuthenticated(authorization);
        if (!session) return { success: false, error: "Session not found" };

        const user = await this.auth.getUserByEmail(session.email);
        if (!user) return { success: false, error: "User not found" };

        return {
            success: true,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            joinDate: user.joinDate
        };

    }

    async getPublicCollection(collectionId: string) {
        try {
            const collection = this.database.GetDB().collection(MongoCollections.collections);
            const data = await collection.findOne({ _id: new ObjectId(collectionId) });

            if (!data) return { success: false, error: "Collection not found" };

            return { success: true, collection: data };
        } catch (e) {
            return { success: false, error: "Invalid ID" };
        }
    }

}