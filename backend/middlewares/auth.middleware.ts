import { IDBService } from "../services/modules/database/db.service";
import type { MiddlewareHandler } from "hono";
import { Session } from "../services/types";
import { AuthService } from "../services/modules/auth/auth.service";

const database : IDBService = IDBService.GetInstance();
const auth = new AuthService(database);

export function makeAuthMiddleware(): MiddlewareHandler {
  
    return async (c, next) => {
    
    let authHeader = c.req.header("authorization");
    if (!authHeader) authHeader = "";

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader

    const session = await auth.isAuthenticated(token);
    if (!session) return c.json({ success: false, error: "Invalid session" }, 401);

    c.set("session", session as Session);
    await next();

  }

}