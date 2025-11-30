import { Injectable, NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { AuthService } from '../auth/auth.service';
import { FbrService } from '../fbr/fbr.service';
import { VendorDocument } from '../vendor/schemas/vendor.schema';
import { VendorService } from '../vendor/vendor.service';

@Injectable()
export class InvoiceService {
  private vendorInvoiceCounters = new Map<string, number>();

  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    private readonly authService: AuthService,
    private readonly fbrService: FbrService,
    private readonly vendorService: VendorService,
  ) {}

  private generateInvoiceNumber(vendorId: string): string {
    const counter = (this.vendorInvoiceCounters.get(vendorId) ?? 0) + 1;
    this.vendorInvoiceCounters.set(vendorId, counter);
    return `${vendorId}-${counter.toString().padStart(6, '0')}`;
  }

  async register(dto: CreateInvoiceDto, vendor: VendorDocument): Promise<any> {
    const v = await this.vendorService.findOne(vendor._id.toString());
    if (!v.isRegistered) {
      throw new ForbiddenException('Vendor must be approved by FBR before issuing invoices');
    }
    if (!v.posId || !v.integrationKey || !v.integrationSecret) {
      throw new InternalServerErrorException('Vendor is missing issued FBR credentials');
    }
    const invoiceNumber = this.generateInvoiceNumber(v._id.toString());
    if (dto.posId && dto.posId !== v.posId) {
      throw new ForbiddenException('Provided POS ID does not match the FBR-issued POS');
    }
    const posId = dto.posId ?? v.posId;
    const dateTime = dto.dateTime ?? new Date().toISOString();

   const totalAmount = dto.items.reduce((sum, item) => {
    const tax = (item.price * item.taxRate) / 100;
    return sum + item.price * item.quantity + tax;
   }, 0);
    const created = new this.invoiceModel({
      vendorId: v._id.toString(),
      invoiceNumber,
      posId,
      dateTime,
      buyer: dto.buyer,
      items: dto.items,
      totalAmount: totalAmount ,
      currency: dto.currency,
      status: 'PENDING',
    });
    const saved = await created.save();
    try {
      const token = await this.authService.getVendorToken(v._id.toString());
      const response = await this.fbrService.post<{
        status: string;
        qrCode: string;
        digitalSignature: string;
      }>('/invoices/register', saved.toObject(), {
        token,
        posId,
        integrationKey: v.integrationKey,
        integrationSecret: v.integrationSecret,
      });
      saved.status = response.data.status === 'ACCEPTED' ? 'REGISTERED' : 'FAILED';
      saved.fbrCorrelationId = response.correlationId;
      saved.qrCode = response.data.qrCode;
      saved.digitalSignature = response.data.digitalSignature;
      await saved.save();
    } catch (err) {
      saved.status = 'FAILED';
      await saved.save();
      throw new InternalServerErrorException('Failed to submit invoice to FBR');
    }

    return saved;
  }

  async findOne(id: string): Promise<InvoiceDocument> {
    const invoice = await this.invoiceModel.findById(id).exec();
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return invoice;
  }

  async findVendorInvoices(vendorId: string): Promise<InvoiceDocument[]> {
    return this.invoiceModel.find({ vendorId }).exec();
  }
}
