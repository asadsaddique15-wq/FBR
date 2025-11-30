import { Body, Controller, Get, Post, Param, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiCreatedResponse, ApiOkResponse, ApiBody } from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { SecurityKeyGuard } from './guards/security-key.guard';
import { SecurityKeyAuthDto } from './dto/security-key-auth.dto';

@ApiTags('invoice')
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('generate')
  @UseGuards(SecurityKeyGuard)
  @ApiCreatedResponse({ description: 'Invoice generated successfully' })
  @ApiBody({ 
    type: CreateInvoiceDto,
    description: 'Invoice data with securityKey for authentication'
  })
  async generateInvoice(@Body() body: CreateInvoiceDto & { securityKey: string }, @Request() req: any) {
    // Vendor info is attached by SecurityKeyGuard
    const vendorId = req.vendor.vendorId.toString();
    // Remove securityKey from DTO before passing to service
    const { securityKey, ...createInvoiceDto } = body;
    return this.invoiceService.createInvoice(vendorId, createInvoiceDto);
  }

  @Post('my-invoices')
  @UseGuards(SecurityKeyGuard)
  @ApiOkResponse({ description: 'Returns all invoices for authenticated vendor' })
  @ApiBody({ 
    type: SecurityKeyAuthDto,
    description: 'Security key for authentication'
  })
  async getMyInvoices(@Body() authDto: SecurityKeyAuthDto, @Request() req: any) {
    const vendorId = req.vendor.vendorId.toString();
    return this.invoiceService.getVendorInvoices(vendorId);
  }

  @Post('get/:id')
  @UseGuards(SecurityKeyGuard)
  @ApiOkResponse({ description: 'Returns invoice by ID' })
  @ApiBody({ 
    type: SecurityKeyAuthDto,
    description: 'Security key for authentication'
  })
  async getInvoiceById(@Param('id') invoiceId: string, @Request() req: any) {
    const invoice = await this.invoiceService.getInvoiceById(invoiceId);
    
    // Verify invoice belongs to the authenticated vendor
    if (invoice.vendorId.toString() !== req.vendor.vendorId.toString()) {
      throw new UnauthorizedException('Invoice does not belong to this vendor');
    }
    
    return invoice;
  }

  @Get('all')
  @ApiOkResponse({ description: 'Returns all invoices (for admin/FBR use)' })
  async getAllInvoices() {
    return this.invoiceService.getAllInvoices();
  }
}

