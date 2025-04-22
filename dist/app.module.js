"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = AppModule;
const user_module_1 = require("./user/user.module");
async function AppModule(app) {
    await (0, user_module_1.UserModule)(app);
}
//# sourceMappingURL=app.module.js.map