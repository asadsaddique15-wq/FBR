import { Module } from '@nestjs/common';
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
})
export class AppModule {}
