import { describe, expect, test, beforeAll } from "vitest";
import { IDBService } from "../services/modules/database/db.service";
import { UserServices } from "../services/modules/users/user.service";

const database = IDBService.GetInstance();
const UserRepository = new UserServices(database);

describe("Get a complete list of all users registered in the database.", () => {
    beforeAll(async () => {
        await database.setup();
    });
    test("Checks the database return and validates the user's data structure.", async () => {
        
        const users = await UserRepository.getUsers();
        expect(users).toBeInstanceOf(Array);
        expect(users.length).toBeGreaterThan(0);
        expect(typeof users[0].email).toBe("string");
        expect(typeof users[0].avatarUrl).toBe("string");
        expect(typeof users[0].name).toBe("string");
        expect(typeof users[0].password).toBe("string");
        expect(users[0].joinDate).toBeInstanceOf(Date);
        
    });
});