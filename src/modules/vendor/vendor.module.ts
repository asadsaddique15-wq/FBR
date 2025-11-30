import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { Vendor, VendorSchema } from './schemas/vendor.schema'; // <- Vendor class here
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vendor.name, schema: VendorSchema }]),
    AuthModule,
  ],
  controllers: [VendorController],
  providers: [VendorService],
  exports: [VendorService, MongooseModule],
})
export class VendorModule {}
