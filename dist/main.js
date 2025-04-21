"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const cookie_1 = require("@fastify/cookie");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter({
        ignoreTrailingSlash: true,
    }));
    await app.register(cookie_1.default, {
        secret: process.env.COOKIE_SECRET,
    });
    const port = process.env.PORT ? +process.env.PORT : 5000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Server ready at http://localhost:${port}`);
}
bootstrap().catch((err) => {
    console.error('Error during bootstrap:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map