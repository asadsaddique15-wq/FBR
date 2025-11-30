import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';
import { Vendor, VendorSchema } from '../vendor/schemas/vendor.schema';
import { VendorModule } from '../vendor/vendor.module';
import { SecurityKeyGuard } from './guards/security-key.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Vendor.name, schema: VendorSchema },
    ]),
    VendorModule,
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService, SecurityKeyGuard],
  exports: [InvoiceService],
})
export class InvoiceModule {}

