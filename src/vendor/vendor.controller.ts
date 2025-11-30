import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SignupDto } from './dto/signup.dto';
import { VendorService } from './vendor.service';
import { LoginDto } from './dto/login-dto';
@ApiTags('auth') // tag for swagger
@Controller('auth') // base route for auth
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}
 @Post('signup')
 @ApiCreatedResponse({ description: 'Vendor registered. Returns NTN and security key.' })
 async signup(@Body() dto: SignupDto) {
  return this.vendorService.createVendor(dto); //still passes to service
 }

  @Post('login')
  @ApiCreatedResponse({ description: 'Vendor login using security key' })
  async login(@Body() dto: LoginDto) {
  return this.vendorService.login(dto.securityKey);
  }
}
