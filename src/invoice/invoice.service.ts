import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { CreateInvoiceDto, InvoiceItemDto } from './dto/create-invoice.dto';
import { Vendor, VendorDocument } from '../vendor/schemas/vendor.schema';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
  ) {}

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    
    // Find the latest invoice for this year
    const latestInvoice = await this.invoiceModel
      .findOne({ invoiceNumber: new RegExp(`^${prefix}`) })
      .sort({ invoiceNumber: -1 })
      .exec();

    let sequence = 1;
    if (latestInvoice) {
      const lastSequence = parseInt(latestInvoice.invoiceNumber.split('-')[2] || '0');
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  async createInvoice(vendorId: string, createInvoiceDto: CreateInvoiceDto) {
    // Get vendor details
    const vendor = await this.vendorModel.findById(vendorId).exec();
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    if (vendor.status !== 'approved') {
      throw new BadRequestException('Vendor must be approved to generate invoices');
    }

    // Calculate invoice totals
    const items = createInvoiceDto.items.map((item: InvoiceItemDto) => {
      const total = item.quantity * item.unitPrice;
      const taxRate = item.taxRate || 0;
      const taxAmount = (total * taxRate) / 100;
      
      return {
        itemName: item.itemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: taxRate,
        total: total,
        taxAmount: taxAmount,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
    const totalAmount = subtotal + totalTax;

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // Create invoice
    const invoice = new this.invoiceModel({
      invoiceNumber,
      vendorId: vendor._id,
      vendorNTN: vendor.ntn,
      vendorName: `${vendor.firstName} ${vendor.lastName}`,
      vendorAddress: vendor.companyAddress,
      customerName: createInvoiceDto.customerName,
      customerCNIC: createInvoiceDto.customerCNIC,
      customerAddress: createInvoiceDto.customerAddress,
      items: items,
      subtotal,
      totalTax,
      totalAmount,
      invoiceDate: createInvoiceDto.invoiceDate ? new Date(createInvoiceDto.invoiceDate) : new Date(),
      status: createInvoiceDto.paymentMethod ? 'paid' : 'pending',
      paymentMethod: createInvoiceDto.paymentMethod,
      paymentDate: createInvoiceDto.paymentMethod ? new Date() : undefined,
      notes: createInvoiceDto.notes,
    });

    const savedInvoice = await invoice.save();
    return savedInvoice;
  }

  async getInvoiceById(invoiceId: string) {
    const invoice = await this.invoiceModel.findById(invoiceId).exec();
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  async getVendorInvoices(vendorId: string) {
    return this.invoiceModel.find({ vendorId: new Types.ObjectId(vendorId) }).sort({ invoiceDate: -1 }).exec();
  }

  async getAllInvoices() {
    return this.invoiceModel.find().sort({ invoiceDate: -1 }).exec();
  }
}

