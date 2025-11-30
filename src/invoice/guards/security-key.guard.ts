import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { VendorService } from '../../vendor/vendor.service';

@Injectable()
export class SecurityKeyGuard implements CanActivate {
  constructor(private vendorService: VendorService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const securityKey = request.body?.securityKey || request.headers['x-security-key'];

    if (!securityKey) {
      throw new UnauthorizedException('Security key is required');
    }

    try {
      // Validate security key and get vendor info
      const vendorInfo = await this.vendorService.validateSecurityKey(securityKey);
      
      if (!vendorInfo) {
        throw new UnauthorizedException('Invalid security key');
      }

      // Check if vendor is approved
      if (vendorInfo.status !== 'approved') {
        throw new UnauthorizedException('Vendor must be approved to generate invoices');
      }

      // Attach vendor info to request for use in controller
      request.vendor = vendorInfo;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }
}

