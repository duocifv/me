"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("src/db/schema");
const drizzle_config_1 = require("src/db/drizzle.config");
class UserService {
    async create(data) {
        const [result] = await drizzle_config_1.db.insert(schema_1.users).values(data);
        return result;
    }
    async findAll() {
        console.log(" ping ---> 2");
        const result = await drizzle_config_1.db.select().from(schema_1.users).execute();
        console.log(" ping ---> 34", result);
        return result;
    }
    findOne(id) {
        return drizzle_config_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
    }
    update(id, data) {
        return drizzle_config_1.db
            .update(schema_1.users)
            .set(data)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
    }
    remove(id) {
        return drizzle_config_1.db.delete(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map