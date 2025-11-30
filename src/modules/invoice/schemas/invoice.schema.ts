import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true })
  vendorId: string;

  @Prop({ required: true })
  invoiceNumber: string;

  @Prop()
  posId: string;

  @Prop()
  dateTime: string;

  @Prop({ type: Object, required: true })
  buyer: Record<string, any>;

  @Prop({ type: Array, required: true })
  items: any[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ default: 'PENDING' })
  status: 'PENDING' | 'REGISTERED' | 'FAILED';

  @Prop()
  fbrCorrelationId?: string;

  @Prop()
  qrCode?: string;

  @Prop()
  digitalSignature?: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
