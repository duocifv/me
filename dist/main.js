"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const zod_nestjs_1 = require("@anatine/zod-nestjs");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const multipart_lugin_1 = require("./plugins/multipart.lugin");
const cookie_plugin_1 = require("./plugins/cookie.plugin");
const file_plugin_1 = require("./plugins/file.plugin");
const sensible_1 = require("@fastify/sensible");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter());
    app.register(sensible_1.default);
    app.register(multipart_lugin_1.multipartPlugin);
    app.register(cookie_plugin_1.cookiePlugin);
    app.register(file_plugin_1.fileManagerPlugin);
    if (process.env.ENABLE_SWAGGER) {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('My API')
            .setDescription('API documentation using Zod and Swagger')
            .setVersion('1.0')
            .addServer('http://localhost:5000/', 'Upload server')
            .build();
        (0, zod_nestjs_1.patchNestjsSwagger)();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api', app, document);
    }
    const port = process.env.PORT ? +process.env.PORT : 5000;
    await app.listen(port);
    console.log(`🚀 Server ready at http://localhost:${port}`);
}
bootstrap().catch((err) => {
    console.error('Error during bootstrap:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map