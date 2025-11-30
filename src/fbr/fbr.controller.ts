import { Controller, Param, Patch, Get } from '@nestjs/common';
import { FbrService } from './fbr.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { EmailService } from 'src/email/email.service'
import { EmailModule } from 'src/email/email.module';
@ApiTags('FBR')
@Controller('fbr')
export class FbrController {
  constructor(private fbrService: FbrService, private emailService : EmailService) {}

  @Patch('approve/:id')
  @ApiOkResponse({ description: 'Vendor approved & POS ID generated.' })
  async approveVendor(@Param('id') vendorId: string) {
    return this.fbrService.approveVendor(vendorId);
  }
  
  @Patch('reject/:id')
  @ApiOkResponse({ description: 'Vendor rejected.' })
  async rejectVendor(@Param('id') vendorId: string) {
    return this.fbrService.rejectVendor(vendorId);
  }

  @Patch('send-email/:id')
  @ApiOkResponse({ description: 'Send email to vendor.' })
  async sendEmailToVendor(@Param('id') vendorId: string) {
    //fetch vendor data
    const vendor = await this.fbrService.getVendorById(vendorId);
    if (!vendor) return { message: 'Vendor not found' };
    let subject: string;
    let text: string;
    //email based on status
    if (vendor.status === 'approved') {
      subject = 'Vendor Approved';
      text = `Dear ${vendor.firstName}, your registration has been approved. Your POS ID is ${vendor.posId}.`;
    } else if (vendor.status === 'rejected') {
      subject = 'Vendor Rejected';
      text = `Dear ${vendor.firstName}, your registration has been rejected.`;
    } else {
      subject = 'Vendor Registration Pending';
      text = `Dear ${vendor.firstName}, your registration is still pending.`;
    }
    //Send email
    await this.emailService.sendVendorEmail(vendor.email, subject, text);
    return { message: 'Email sent successfully', vendorId: vendor._id };
  }

  @Get()
  @ApiOkResponse({ description: 'Returns all vendors' })
  async getAllVendors() {
    return this.fbrService.findAll();
  }

  @Get('pending')
  @ApiOkResponse({ description: 'Returns all vendors whose status is pending' })
  async getPendingVendors() {
    return this.fbrService.findPending();
  }

}
