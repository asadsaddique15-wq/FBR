import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BusinessType } from '../../../common/enums/business-type.enum';
import { VendorRole } from '../../../common/enums/vendor-role.enum';
@Schema({ timestamps: true })  
export class Vendor {
  @Prop({ required: true })
  displayName: string;

  @Prop({ required: true })
  gstNumber: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  contactPhone: string;

  @Prop({ enum: BusinessType, default: BusinessType.GENERAL })
  businessType: BusinessType;

  @Prop({ enum: VendorRole, default: VendorRole.USER })
  role: VendorRole;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: false })
  isRegistered: boolean;

  @Prop()
  posId?: string;

  @Prop()
  integrationKey?: string;

  @Prop()
  integrationSecret?: string;
  // timestamps will auto-generate:
  // createdAt: Date
  // updatedAt: Date
}

export type VendorDocument = Vendor & Document;
export const VendorSchema = SchemaFactory.createForClass(Vendor);
