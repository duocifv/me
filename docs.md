const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description')
    .setVersion('1.0')
    .addServer('http://localhost:3000')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const yamlDocument = yaml.dump(document);
  fs.writeFileSync('./openapi.yaml', yamlDocument);


nest g resource user


npm install -g @nestjs/cli    # hoặc
npx @nestjs/cli@latest

2. Cách tạo nhanh với CLI
Khởi tạo module:

bash
Sao chép
Chỉnh sửa
nest g module auth
Tạo controller và service cho auth (nếu cần):

bash
Sao chép
Chỉnh sửa
nest g controller auth
nest g service auth
AuthController chứa các route như /login, /refresh…

AuthService chịu trách nhiệm sinh JWT, verify credentials, lưu/rotate refresh token



báo lỗi zod
https://github.com/aiji42/zod-i18n/blob/main/packages/core/locales/en/zod.json



https://github.com/nestjs/nest/blob/master/benchmarks/all_output.txt