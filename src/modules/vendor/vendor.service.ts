import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Vendor, VendorDocument } from './schemas/vendor.schema';
import { hashPassword, verifyPassword } from '../../common/utils/password.util';
@Injectable()
export class VendorService {
  constructor(@InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,) {}

  async create(payload: CreateVendorDto): Promise<VendorDocument> {
    const exists = await this.vendorModel.findOne({ email: payload.email }).lean().exec();
    if (exists) {
      throw new BadRequestException(`Vendor with email ${payload.email} already exists`);
    }

    const passwordHash = hashPassword(payload.password);
    const created = new this.vendorModel({
      displayName: payload.displayName,
      gstNumber: payload.gstNumber,
      address: payload.address,
      email: payload.email,
      contactPhone: payload.contactPhone,
      businessType: payload.businessType ?? undefined,
      role: payload.role ?? undefined,
      passwordHash,
      isRegistered: false,
    });
    return created.save();
  }

  async findAll(): Promise<VendorDocument[]> {
    return this.vendorModel.find().exec();
  }

  async findOne(id: string): Promise<VendorDocument> {
    const vendor = await this.vendorModel.findById(id).exec();
    if (!vendor) throw new NotFoundException(`Vendor ${id} not found`);
    return vendor;
  }

  async update(id: string, payload: UpdateVendorDto): Promise<VendorDocument> {
    const vendor = await this.findOne(id);
    if (payload.password) {
      vendor.passwordHash = hashPassword(payload.password);
      delete (payload as any).password;
    }
    Object.assign(vendor, payload);
    return vendor.save();
  }

  async remove(id: string): Promise<void> {
    const vendor = await this.findOne(id);
    await vendor.deleteOne();
  }

  async markRegistered(
    id: string,
    credentials?: { posId: string; integrationKey: string; integrationSecret: string },
  ): Promise<VendorDocument> {
    const vendor = await this.findOne(id);
    vendor.isRegistered = true;
    if (credentials) {
      vendor.posId = credentials.posId;
      vendor.integrationKey = credentials.integrationKey;
      vendor.integrationSecret = credentials.integrationSecret;
    }
    return vendor.save();
  }

  async findByEmailOrNull(email: string): Promise<VendorDocument | null> {
    return this.vendorModel.findOne({ email }).exec();
  }

  async validateCredentials(email: string, password: string): Promise<VendorDocument | undefined> {
    const vendor = await this.findByEmailOrNull(email);
    if (!vendor) return undefined;
    const isValid = verifyPassword(password, vendor.passwordHash);
    return isValid ? vendor : undefined;
  }
}
