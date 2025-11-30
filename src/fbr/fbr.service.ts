import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vendor } from '../vendor/schemas/vendor.schema';
@Injectable()
export class FbrService {
  constructor(
    @InjectModel(Vendor.name) private vendorModel: Model<Vendor>,
  ) {}

  async approveVendor(vendorId: string) {
    const vendor = await this.vendorModel.findById(vendorId);
    if (!vendor) throw new NotFoundException('Vendor not found');
    const posId = 'POS-' + Math.floor(100000 + Math.random() * 900000);
    vendor.status = 'approved';
    vendor.posId = posId;
    await vendor.save();
    return vendor;
  }

  async rejectVendor(vendorId: string) {
    const vendor = await this.vendorModel.findById(vendorId);
    if (!vendor) throw new NotFoundException('Vendor not found');
    vendor.status = 'rejected';
    vendor.posId = ''; 
    await vendor.save();
    return vendor;
  }

  async getVendorById(vendorId: string) {
  const vendor = await this.vendorModel.findById(vendorId);
  return vendor;
}

  async findAll() {
  return this.vendorModel.find().exec(); 
  }

  async findPending() {
  return this.vendorModel.find({ status: 'pending' }).exec();
  }

}
