import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class InvoiceItem {
  @Prop({ required: true })
  itemName: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  unitPrice: number;

  @Prop({ default: 0 })
  taxRate: number; // Tax rate in percentage

  @Prop({ required: true })
  total: number; // quantity * unitPrice

  @Prop({ default: 0 })
  taxAmount: number; // taxAmount calculated from total * taxRate
}

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true, unique: true })
  invoiceNumber: string; // Auto-generated unique invoice number

  @Prop({ type: Types.ObjectId, ref: 'Vendor', required: true })
  vendorId: Types.ObjectId;

  @Prop({ required: true })
  vendorNTN: string;

  @Prop({ required: true })
  vendorName: string;

  @Prop({ required: true })
  vendorAddress: string;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  customerCNIC: string;

  @Prop({ required: true })
  customerAddress: string;

  @Prop({ type: [InvoiceItem], required: true })
  items: InvoiceItem[];

  @Prop({ required: true, default: 0 })
  subtotal: number; // Sum of all item totals

  @Prop({ required: true, default: 0 })
  totalTax: number; // Total tax amount

  @Prop({ required: true, default: 0 })
  totalAmount: number; // subtotal + totalTax

  @Prop({ required: true })
  invoiceDate: Date;

  @Prop({ default: 'pending' })
  status: string; // pending, paid, cancelled

  @Prop()
  paymentMethod?: string;

  @Prop()
  paymentDate?: Date;

  @Prop()
  notes?: string;
}

export const InvoiceItemSchema = SchemaFactory.createForClass(InvoiceItem);
export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

