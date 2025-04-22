"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = (0, fastify_1.default)({ logger: false });
    await (0, app_module_1.AppModule)(app);
    await app.listen({ port: Number(process.env.PORT) || 3000 });
    app.log.info(`Server running on port ${process.env.PORT || 3000}`);
}
bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map