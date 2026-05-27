import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  });

  const configService = app.get(ConfigService);

  // const clientUrl = configService.get<string>('clientUrl', '*');
  // app.enableCors({
  //   origin: clientUrl.split(',').map((url) => url.trim()),
  //   credentials: true,
  // });

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  interface SwaggerConfig {
    title: string;
    description: string;
    version: string;
  }

  const swaggerConfigData = configService.get<SwaggerConfig>('swagger') || {
    title: 'NestJS API',
    description: 'NestJS Swagger Documentation',
    version: '1.0',
  };

  const config = new DocumentBuilder()
    .setTitle(swaggerConfigData.title)
    .setDescription(swaggerConfigData.description)
    .setVersion(swaggerConfigData.version)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get<number>('port', 3000);
  const host = configService.get<string>('host', 'localhost');
  await app.listen(port, host);
  console.log(`Application is running on: http://${host}:${port}/docs`);
}
void bootstrap();
