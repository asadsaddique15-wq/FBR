import {Body,Controller,ForbiddenException,Get,Param,Post,UseGuards} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentVendor } from '../../common/decorators/current-vendor.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { VendorRole } from '../../common/enums/vendor-role.enum';
import type { VendorDocument } from '../vendor/schemas/vendor.schema';

@ApiTags('Invoices')
@Controller('invoices')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register an invoice with FBR on behalf of vendor' })
  async register(
    @Body() dto: CreateInvoiceDto,
    @CurrentVendor() vendor: VendorDocument,
  ) {
    return await this.invoiceService.register(dto, vendor);
  }

  
  @Get('mine')
  @ApiOperation({ summary: 'List invoices for the authenticated vendor' })
  async findMyInvoices(@CurrentVendor() vendor: any) {
    return await this.invoiceService.findVendorInvoices(vendor._id.toString());
  }


  @Get(':id')
  @ApiOperation({ summary: 'Fetch single invoice (admin or owner only)' })
  async findOne(
    @Param('id') id: string,
    @CurrentVendor() vendor: VendorDocument,
  ) {const invoice = await this.invoiceService.findOne(id);
    if (
      vendor.role !== VendorRole.ADMIN &&
      invoice.vendorId.toString() !== vendor._id.toString()
    ) {
      throw new ForbiddenException('You can only view your own invoices');
    }
    return invoice;
  }

  @Get('vendor/:vendorId')
  @Roles(VendorRole.ADMIN)
  @ApiOperation({ summary: 'Admin-only view of vendor invoices' })
  async findByVendor(@Param('vendorId') vendorId: string) {
    return await this.invoiceService.findVendorInvoices(vendorId);
  }
}
