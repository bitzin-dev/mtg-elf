import { schemaRegister } from "../../schemas";
import z from "zod";

export type UserSchema = z.infer<typeof schemaRegister>;

export interface IUserRepository {
    getUsers() : Promise<Array<UserSchema>>
}