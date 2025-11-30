import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum RegistryStatus {
  Pending = 'PENDING',
  Submitted = 'SUBMITTED',
  Approved = 'APPROVED',
  Rejected = 'REJECTED',
}

@Schema({ timestamps: true })
export class RegistryDocument extends Document {
  @Prop({ required: true })
  vendorId: string;

  @Prop({ required: true })
  documentUrl: string;

  @Prop({ required: true })
  submittedBy: string;

  @Prop({ enum: RegistryStatus, default: RegistryStatus.Submitted })
  status: RegistryStatus;

  @Prop()
  submittedAt: Date;

  @Prop()
  issuedPosId?: string;

  @Prop()
  issuedIntegrationKey?: string;

  @Prop()
  issuedIntegrationSecret?: string;
}

export const RegistrySchema = SchemaFactory.createForClass(RegistryDocument);
