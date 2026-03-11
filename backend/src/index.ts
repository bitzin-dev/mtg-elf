import { Context, Hono } from 'hono'
import Controller from '../services/controller';
import { zValidator } from '@hono/zod-validator';
import { schemaRegister, schemaLogin, schemaCreateCollection, schemaSavedSearch, schemaDeleteSearch, schemaDeleteCollection, schemaCardOperation, schemaRenameCollection } from '../services/schemas';
import { cors } from 'hono/cors';
import { makeAuthMiddleware } from '../middlewares/auth.middleware';
import { IDBService } from '../services/modules/database/db.service';
import MTG from '../services/modules/mtg/mtg.service';
import { AuthService } from '../services/modules/auth/auth.service';

const app = new Hono();
const api = new Hono();

// Habilita o CORS para as rotas da API.
app.use('*', cors());
const db = IDBService.GetInstance();

// Services - Repositorys
const MTGService = new MTG(db);
const auth = new AuthService(db);

// Middleware para setup do banco de dados
app.use('*', async (c, next) => {
    await db.setup();
    await next();
});

// Middleware com autenticação integrada!
app.use('/api/me/*', makeAuthMiddleware());
app.use('/api/create/*', makeAuthMiddleware());

// Routes
const routes = api

    .get("/", async (c) => {
        return c.json(
            { message: 'Hello World', status: 200 }
        );
    })

    .get('/public/collection/:id', async (c) => {
        const id = c.req.param('id');
        return c.json(
            await MTGService.getPublicCollection(id)
        );
    })

    .get('/me', async (c) => {
        const session = c.get("session");
        return c.json(
            await MTGService.GetMe(session.uuid)
        );
    })

    .get('/me/collections', async (c) => {
        const session = c.get("session");
        return c.json(
            await MTGService.MeCollections(session.uuid)
        );
    })

    .get('/me/searches', async (c) => {
        const session = c.get("session");
        return c.json(
            await MTGService.getSearches(session.uuid)
        );
    })

    .delete('/me/searches', zValidator('json', schemaDeleteSearch), async (c) => {
        const session = c.get("session");
        const data = await c.req.json();
        return c.json(
            await MTGService.deleteSearch(data, session.uuid)
        );
    })

    .delete('/me/collection', zValidator('json', schemaDeleteCollection), async (c) => {
        const session = c.get("session");
        const data = await c.req.json();
        return c.json(
            await MTGService.deleteCollection(data, session.uuid)
        );
    })

    .post('/me/collection/card', zValidator('json', schemaCardOperation), async (c) => {
        const session = c.get("session");
        const data = await c.req.json();
        return c.json(
            await MTGService.updateCollection(data, session.uuid)
        );
    })

    .post('/me/collection/rename', zValidator('json', schemaRenameCollection), async (c) => {
        const session = c.get("session");
        const data = await c.req.json();
        return c.json(
            await MTGService.renameCollection(data, session.uuid)
        );
    })

    .post('/create/search', zValidator('json', schemaSavedSearch), async (c) => {
        const session = c.get("session");
        const data = await c.req.json();
        return c.json(
            await MTGService.createSearch(data, session.uuid)
        );
    })

    .post('/create/collection', zValidator('json', schemaCreateCollection), async (c) => {
        const session = c.get("session");
        const data = await c.req.json();
        return c.json(
            await MTGService.createCollection(data, session.uuid)
        );
    })

    // Register
    .post("/register", zValidator('json', schemaRegister), async (c) => {
        const data = await c.req.json();
        return c.json(
            await auth.register(data)
        );
    })

    // Login
    .post("/login", zValidator('json', schemaLogin), async (c) => {
        const data = await c.req.json();
        return c.json(
            await auth.login(data)
        );
    })

app.route('/api', routes);

export type AppType = typeof routes;

export default {
    port: Bun.env.HONO_PORT || 4000,
    fetch: async (req: Request, env: unknown, ctx: unknown) => {
        return app.fetch(req, env, ctx as any);
    }
}
