import { Module } from '@nestjs/common';
import { FbrService } from './fbr.service';
import { FbrController } from './fbr.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Vendor, VendorSchema } from '../vendor/schemas/vendor.schema';
import { VendorModule } from 'src/vendor/vendor.module';
import { EmailModule } from '../email/email.module';
import { EmailService } from 'src/email/email.service';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vendor.name, schema: VendorSchema }]),
     EmailModule,
     ConfigModule

  ],
  controllers: [FbrController],
  providers: [FbrService, EmailService]
})
export class FbrModule {}
