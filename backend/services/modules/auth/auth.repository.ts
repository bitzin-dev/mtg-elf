import { schemaRegister, schemaLogin } from "../../schemas";
import { RequestResult, SessionResult } from "../../types";
import z from "zod";

export type schemaRegisterType = z.infer<typeof schemaRegister>;
export type schemaLoginType = z.infer<typeof schemaLogin>;

export interface IAuthRepository {
    register(data : schemaRegisterType) : Promise<RequestResult>
    login(data : schemaLoginType) : Promise<RequestResult>
    create_session(email : string) : Promise<SessionResult>
    isAuthenticated(authorization : string) : Promise<any>
}