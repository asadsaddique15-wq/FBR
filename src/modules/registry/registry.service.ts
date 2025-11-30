import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegistryRequestDto } from './dto/registry-request.dto';
import { RegistryDocument, RegistryStatus } from './schemas/registry.schema';
import { VendorService } from '../vendor/vendor.service';

@Injectable()
export class RegistryService {
  constructor(
    @InjectModel(RegistryDocument.name) private registryModel: Model<RegistryDocument>,
    private readonly vendorService: VendorService,
  ) {}

  async submit(dto: RegistryRequestDto): Promise<RegistryDocument> {
    const vendor = await this.vendorService.findOne(dto.vendorId);
    if (!vendor) {
      throw new BadRequestException(`Vendor ${dto.vendorId} not found`);
    }
    const record = new this.registryModel({
      vendorId: vendor.id,
      documentUrl: dto.documentUrl,
      submittedBy: dto.submittedBy,
      status: RegistryStatus.Submitted,
      submittedAt: new Date(),
    });
    return record.save();
  }

  private generateCredentials(vendorId: string) {
    const suffix = vendorId.slice(-4).toUpperCase();
    return {
      posId: `POS-${suffix}-${randomBytes(2).toString('hex').toUpperCase()}`,
      integrationKey: `FBR-${randomBytes(6).toString('hex')}`,
      integrationSecret: randomBytes(32).toString('hex'),
    };
  }

  async approve(vendorId: string): Promise<RegistryDocument> {
    const record = await this.registryModel.findOne({ vendorId }).exec();
    if (!record) {
      throw new NotFoundException(`Registry record for ${vendorId} not found`);
    }
    // Basic validation example: documentUrl must be a URL (very light check)
    if (!record.documentUrl || !record.documentUrl.startsWith('http')) {
      record.status = RegistryStatus.Rejected;
      await record.save();
      return record;
    }
    const credentials = this.generateCredentials(vendorId);
    record.status = RegistryStatus.Approved;
    record.issuedPosId = credentials.posId;
    record.issuedIntegrationKey = credentials.integrationKey;
    record.issuedIntegrationSecret = credentials.integrationSecret;
    await record.save();
    await this.vendorService.markRegistered(vendorId, credentials);
    return record;
  }

  async reject(vendorId: string, reason?: string): Promise<RegistryDocument> {
    const record = await this.registryModel.findOne({ vendorId }).exec();
    if (!record) {
      throw new NotFoundException(`Registry record for ${vendorId} not found`);
    }
    record.status = RegistryStatus.Rejected;
    await record.save();
    return record;
  }

  async status(vendorId: string): Promise<RegistryDocument | null> {
    return this.registryModel.findOne({ vendorId }).exec();
  }
}
