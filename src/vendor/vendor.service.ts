import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import * as bcrypt from 'bcryptjs';
import { SignupDto } from './dto/signup.dto';
import { Vendor, VendorDocument } from './schemas/vendor.schema';
@Injectable()
export class VendorService {
  constructor(@InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>) {}
  private async generateUniqueNTN(): Promise<string> {
    while (true) {
      const ntn = Math.floor(100000000 + Math.random() * 900000000).toString();
      const exists = await this.vendorModel.findOne({ ntn }).exec();
      if (!exists) return ntn;
    }
  }
  private generateSecurityKey(): string {
    return nanoid(12);
  }

  async createVendor(createDto: SignupDto) {
    const ntn = await this.generateUniqueNTN(); 
    const securityKey = this.generateSecurityKey();
    const salt = await bcrypt.genSalt(10); //generate salt
    const hash = await bcrypt.hash(securityKey, salt); // hash security key
    // create document to store
    const created = new this.vendorModel({
      ...createDto,
      ntn,
      securityKeyHash: hash,
      status: 'pending', 
    });
    try {
      const saved = await created.save(); // save to mongodb
      //return plain securityKey only in response
      return {id: saved._id,ntn,securityKey, status: saved.status,};
    } catch (err) {
      throw new ConflictException('Vendor with this CNIC or email already exists');
    }
  }

 async login(securityKey: string) {
  const vendors = await this.vendorModel.find().exec(); 
  for (const vendor of vendors) {
    const isMatch = await bcrypt.compare(securityKey, vendor.securityKeyHash);
    if (isMatch) {
      return {
        message: 'Login successful',
        vendorId: vendor._id,
        ntn: vendor.ntn,
        status: vendor.status,
        posId: vendor.posId ?? null 
      };
    }
  }
  // If no match found
  throw new Error('Invalid security key');
  }

  async findAll() {
  return this.vendorModel.find().exec(); 
  }

  async findPending() {
  return this.vendorModel.find({ status: 'pending' }).exec();
  }

  async validateSecurityKey(securityKey: string) {
    const vendors = await this.vendorModel.find().exec(); 
    for (const vendor of vendors) {
      const isMatch = await bcrypt.compare(securityKey, vendor.securityKeyHash);
      if (isMatch) {
        return {
          vendorId: vendor._id,
          ntn: vendor.ntn,
          status: vendor.status,
          posId: vendor.posId ?? null,
          firstName: vendor.firstName,
          lastName: vendor.lastName,
          companyName: vendor.companyName,
          companyAddress: vendor.companyAddress,
        };
      }
    }
    return null;
  }

}
