import { Context, Hono } from 'hono'
import Controller from '../services/controller';
import { zValidator } from '@hono/zod-validator';
import { schemaRegister, schemaLogin, schemaCreateCollection, schemaSavedSearch, schemaDeleteSearch, schemaDeleteCollection, schemaCardOperation } from '../services/schemas';
import { cors } from 'hono/cors';
import { makeAuthMiddleware } from '../middlewares/auth.middleware';

const controller = new Controller();
const app = new Hono();
const setup = controller.setup();

// Habilita o CORS para essa URL 
app.use(cors());

// Middleware para setup do banco de dados
app.use('*', async (c, next) => {
    await setup;
    await next();
});

// Middleware com autenticação integrada!
app.use('/me/*', makeAuthMiddleware(controller));
app.use('/create/*', makeAuthMiddleware(controller));

// Routes
const routes = app

    .get("/", async (c) => {
        return c.json(
            { message: 'Hello World', status: 200 }
        );
    })

    .get('/me', async (c) => {
        const session = c.get("session");
        return c.json(
            await controller.GetMe(session.uuid)
        );
    })

    .get('/me/collections', async (c) => {
        const session = c.get("session");
        return c.json(
            await controller.MeCollections(session.uuid)
        );
    })

    .get('/me/searches', async (c) => {
        const session = c.get("session");
        return c.json(
            await controller.getSearches(session.uuid)
        );
    })

    .delete('/me/searches', zValidator('json', schemaDeleteSearch), async (c) => {
        const session = c.get("session");
        const data = await c.req.json();
        return c.json(
            await controller.deleteSearch(data, session.uuid)
        );
    })

    .delete('/me/collection', zValidator('json', schemaDeleteCollection), async (c) => {
        const session = c.get("session");
        const data = await c.req.json();
        return c.json(
            await controller.deleteCollection(data, session.uuid)
        );
    })

    .post('/me/collection/card', zValidator('json', schemaCardOperation), async (c) => {
        const session = c.get("session");
        const data = await c.req.json();
        return c.json(
            await controller.updateCollection(data, session.uuid)
        );
    })

    .post('/create/search', zValidator('json', schemaSavedSearch), async (c) => {
        const session = c.get("session");
        const data = await c.req.json();
        return c.json(
            await controller.createSearch(data, session.uuid)
        );
    })

    .post('/create/collection', zValidator('json', schemaCreateCollection), async (c) => {
        const session = c.get("session");
        const data = await c.req.json();
        return c.json(
            await controller.createCollection(data, session.uuid)
        );
    })

    // Register
    .post("/register", zValidator('json', schemaRegister), async (c) => {
        const data = await c.req.json();
        return c.json(
            await controller.register(data)
        );
    })

    // Login
    .post("/login", zValidator('json', schemaLogin), async (c) => {
        const data = await c.req.json();
        return c.json(
            await controller.login(data)
        );
    })

export type AppType = typeof routes;

export default {
    port: 4000,
    fetch: async (req: Request, env: unknown, ctx: unknown) => {
        return routes.fetch(req, env, ctx as any);
    }
}