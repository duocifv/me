const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description')
    .setVersion('1.0')
    .addServer('http://localhost:3000')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const yamlDocument = yaml.dump(document);
  fs.writeFileSync('./openapi.yaml', yamlDocument);