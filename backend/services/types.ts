import type { ObjectId } from "mongodb";
import { CollectionFilterType } from "../../front-end/types";
import { AdvancedFilters } from "../../front-end/types";

export interface Session {
    _id: ObjectId;
    email: string;
    uuid: string;
    expires: Date;
}


declare module "hono" {
  interface ContextVariableMap {
    session: Session
  }
}

export interface MockUser {
    name?: string;
    email?: string;
    avatarUrl?: string;
    joinDate?: Date;
    success: boolean;
    error?: string;
}

export interface RequestResult {
    success: boolean;
    error?: string;
    authorization?: string;
}

export interface UserCollection {
    _id: ObjectId;
    name: string;
    email_user: string;    
    filterType: CollectionFilterType;
    filterValue: string;
    query: string;
    createdAt: Date;
    updatedAt: Date;
    ownedCardIds: string[];
    quantities: Record<string, number>;
    buyListIds: string[];
    printListIds: string[];
}


export interface SavedSearch {
    _id: ObjectId;
    email_user: string;
    name: string;
    timestamp: number;
    criteria: {
        searchTerm: string;
        selectedSet: string | null;
        advancedFilters: AdvancedFilters;
    };
}