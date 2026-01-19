
import { hc } from 'hono/client';
import type { AppType } from "../../backend/src/index";
import { schemaLogin, schemaRegister, schemaSavedSearch, schemaDeleteSearch, schemaCreateCollection, schemaDeleteCollection, schemaCardOperation } from '../../backend/services/schemas';
import { z } from 'zod';

// ==========================================
// 2. CLIENT CONFIGURATION
// ==========================================

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

// Cliente RPC Tipado
// O 'hc' cria um proxy que permite chamar rotas como se fossem funções
export const client = hc<AppType>(API_URL, {
    headers: {
        Authorization: localStorage.getItem('portal_auth_token') || ''
    }
});

// ==========================================
// 3. SERVICE WRAPPERS (Opcional, mas recomendado)
// ==========================================

export const backendService = {

    async login(data : z.infer<typeof schemaLogin>) {
        try {
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
            const res = await client.me.$get();
            return await res.json();
        } 
        catch (error) {
            console.error(error);
            return null;
        }
    },

    async getCollections(){
        try {
            const res = await client.me.collections.$get();
            return await res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    async deleteCollection(data : z.infer<typeof schemaDeleteCollection>) {
        try {
            const res = await client.me.collection.$delete({
                json: data
            });
            return await res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    async crateCollection(data : z.infer<typeof schemaCreateCollection>) {
        try {
            const res = await client.create.collection.$post({
                json: data
            });
            return await res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    async UpdateCollection(data : z.infer<typeof schemaCardOperation>) {
        try {
            const res = await client.me.collection.card.$post({
                json: data
            });
            return await res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    async createSearch(data : z.infer<typeof schemaSavedSearch>) {
        try {
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
            const res = await client.me.searches.$get();
            return await res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    async deleteSearch(data : z.infer<typeof schemaDeleteSearch>) {
        try {
            const res = await client.me.searches.$delete({
                json: data
            });
            return await res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

};
