"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = UserModule;
const user_controller_1 = require("./user.controller");
async function UserModule(app) {
    app.register(user_controller_1.userRoutes, { prefix: '/users' });
}
//# sourceMappingURL=user.module.js.map