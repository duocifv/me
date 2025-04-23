"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const cookieParser = require("cookie-parser");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(cookieParser(process.env.COOKIE_SECRET));
    if (process.env.ENABLE_SWAGGER) {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('My API')
            .setDescription('API documentation using Zod and Swagger')
            .setVersion('1.0')
            .addServer('http://localhost:5000/', 'Upload server')
            .build();
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