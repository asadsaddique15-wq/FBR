import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { VendorModule } from './vendor/vendor.module';
import { FbrModule } from './fbr/fbr.module';
import { EmailModule } from './email/email.module';
import { InvoiceModule } from './invoice/invoice.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/fbr_invoice'), // connect to local MongoDB
    VendorModule,
    FbrModule,
    EmailModule,
    InvoiceModule,
  ],
  //providers: [MailerService],
=======
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { VendorModule } from './modules/vendor/vendor.module';
import { AuthModule } from './modules/auth/auth.module';
import { RegistryModule } from './modules/registry/registry.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { FbrModule } from './modules/fbr/fbr.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    VendorModule,
    AuthModule,
    RegistryModule,
    InvoiceModule,
    FbrModule,
  ],
>>>>>>> 5d688854065ec36e355ff792028a8e7680bff78e
})
export class AppModule {}
