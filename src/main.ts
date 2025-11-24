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
