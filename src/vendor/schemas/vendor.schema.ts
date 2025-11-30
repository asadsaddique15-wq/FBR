import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BusinessCategory } from '../enums/business-category.enum';
export type VendorDocument = Vendor & Document;

@Schema({ timestamps: true })
export class Vendor {
  @Prop({ required: true })
  firstName: string; 

  @Prop({ required: true })
  lastName: string; 

  @Prop({ required: true, unique: true }) 
  cnic: string; 

  @Prop({ required: true, unique: true })
  email: string; 

  @Prop({ required: true })
  phone: string; 

  @Prop({ required: true })
  age: number; 

  @Prop({ required: true, enum: BusinessCategory })
  businessCategory: BusinessCategory; 

  @Prop({ required: true })
  companyName: string; 

  @Prop({ required: true })
  companyAddress: string;

  @Prop({ required: true })
  ownershipDocumentUrl: string; 

  @Prop({ required: true, unique: true })
  ntn: string; 

  @Prop({ required: true })
  securityKeyHash: string; 

  @Prop({ default: 'pending' })
  status: string;  

  @Prop()
  posId?: string;
 }
export const VendorSchema = SchemaFactory.createForClass(Vendor);
