import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { Vendor, VendorSchema } from './schemas/vendor.schema';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [MongooseModule.forFeature([{ name: Vendor.name, schema: VendorSchema }]),
   JwtModule.register({
      secret: 'SECRET123', // in production: use env variable
      signOptions: { expiresIn: '1d' },
    }),
],
  controllers: [VendorController],
  providers: [VendorService],
  exports: [VendorService],
})
export class VendorModule {}
