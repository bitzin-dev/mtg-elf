import type Controller from "../services/controller";
import type { MiddlewareHandler } from "hono";
import { Session } from "../services/types";

export function makeAuthMiddleware(controller: Controller): MiddlewareHandler {
  
    return async (c, next) => {
    
    let authHeader = c.req.header("authorization");
    if (!authHeader) authHeader = "";

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader

    const session = await controller.isAuthenticated(token);
    if (!session) return c.json({ success: false, error: "Invalid session" }, 401);

    c.set("session", session as Session);
    await next();

  }

}