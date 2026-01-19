import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import Controller from "../services/controller";
import { schemaLogin, schemaRegister } from "../services/schemas";

const auth_routes = new Hono();
const controller = new Controller();
controller.setup();

auth_routes.post("/login", zValidator('json', schemaLogin), async (c) => {
    const data = await c.req.json();
    return c.json(
        await controller.login(data)
    );
});

export default auth_routes;