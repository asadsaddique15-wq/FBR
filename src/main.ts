<<<<<<< HEAD
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
async function bootstrap() {
  // create nest app
  const app = await NestFactory.create(AppModule);
  //global validation pipe for DTOs
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  //swagger
  const config = new DocumentBuilder()
    .setTitle('FBR Invoice - Auth (Vendor signup)')
    .setDescription('Vendor signup API (NTN + Security key generation)')
    .setVersion('1.0')
    .addTag('auth')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
  console.log(`Server listening on http://localhost:3000`);
  console.log(`Swagger UI available at http://localhost:3000/api`);
}
bootstrap();
=======
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');
  app.useGlobalPipes(
    new ValidationPipe({whitelist: true,transform: true,}),);
  app.useGlobalInterceptors(new LoggingInterceptor());

  const config = new DocumentBuilder()
    .setTitle('FBR Digital Invoicing API')
    .setDescription('Routers for vendors, auth, registry, and invoices')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Vendors')
    .addTag('Auth')
    .addTag('Registry')
    .addTag('Invoices')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
>>>>>>> 5d688854065ec36e355ff792028a8e7680bff78e
