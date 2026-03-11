import { hc } from 'hono/client';
import type { AppType } from "../../backend/src/index";
import { schemaLogin, schemaRegister, schemaSavedSearch, schemaDeleteSearch, schemaCreateCollection, schemaDeleteCollection, schemaCardOperation, schemaRenameCollection } from '../../backend/services/schemas';
import { z } from 'zod';

// ==========================================
// 2. CLIENT CONFIGURATION
// ==========================================

const normalizeApiUrl = (value?: string) => {
    const normalizedValue = value?.trim();

    if (!normalizedValue || normalizedValue === '/') {
        return '/api';
    }

    const withoutTrailingSlash = normalizedValue.replace(/\/+$/, '');
    return withoutTrailingSlash.endsWith('/api') ? withoutTrailingSlash : `${withoutTrailingSlash}/api`;
};

const API_URL = normalizeApiUrl((import.meta as any).env?.VITE_API_URL);

const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('portal_auth_token');
    return token ? { Authorization: token } : {};
};

// Cria o client por request para sempre usar o token mais recente.
const getClient = (withAuth: boolean = true) => hc<AppType>(API_URL, {
    headers: withAuth ? getAuthHeaders() : {}
});

export const clearAuthSession = () => {
    localStorage.removeItem('portal_auth_token');
    localStorage.removeItem('portal_mtg_user_session');
};

// ==========================================
// 3. SERVICE WRAPPERS (Opcional, mas recomendado)
// ==========================================

export const backendService = {

    async login(data: z.infer<typeof schemaLogin>) {
        try {
            const client = getClient(false);
            const res = await client.login.$post({
                json: data
            });
            return await res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    async register(data: z.infer<typeof schemaRegister>) {
        try {
            const client = getClient(false);
            const res = await client.register.$post({
                json: data
            });
            return await res.json();
        }
        catch (error) {
            console.error(error);
            return null;
        }
    },

    async me() {
        try {
            const client = getClient(true);
            const res = await client.me.$get();
            if (res.status === 401) {
                return null;
            }
            return await res.json();
        }
        catch (error) {
            // console.error(error); // Silently fail for auth check
            return null;
        }
    },

    async getCollections() {
        try {
            const client = getClient(true);
            const res = await client.me.collections.$get();
            return await res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    async deleteCollection(data: z.infer<typeof schemaDeleteCollection>) {
        try {
            const client = getClient(true);
            const res = await client.me.collection.$delete({
                json: data
            });
            return await res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    async crateCollection(data: z.infer<typeof schemaCreateCollection>) {
        try {
            const client = getClient(true);
            const res = await client.create.collection.$post({
                json: data
            });
            return await res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    async UpdateCollection(data: z.infer<typeof schemaCardOperation>) {
        try {
            const client = getClient(true);
            const res = await client.me.collection.card.$post({
                json: data
            });
            return await res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    async renameCollection(data: z.infer<typeof schemaRenameCollection>) {
        try {
            const client = getClient(true);
            const res = await client.me.collection.rename.$post({
                json: data
            });
            return await res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    async createSearch(data: z.infer<typeof schemaSavedSearch>) {
        try {
            const client = getClient(true);
            const res = await client.create.search.$post({
                json: data
            });
            return await res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    async getSearches() {
        try {
            const client = getClient(true);
            const res = await client.me.searches.$get();
            return await res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    async deleteSearch(data: z.infer<typeof schemaDeleteSearch>) {
        try {
            const client = getClient(true);
            const res = await client.me.searches.$delete({
                json: data
            });
            return await res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    async getPublicCollection(id: string) {
        try {
            const client = getClient(false);
            const res = await client.public.collection[':id'].$get({
                param: { id }
            });
            return await res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

};
