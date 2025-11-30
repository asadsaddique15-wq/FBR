import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema'; // <-- import Invoice class
import { VendorModule } from '../vendor/vendor.module';
import { FbrModule } from '../fbr/fbr.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema, collection: 'invoices' }, // <-- use Invoice.name
    ]),
    VendorModule,
    FbrModule,
    AuthModule,
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}
