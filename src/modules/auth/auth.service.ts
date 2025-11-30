import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vendor, VendorDocument } from '../vendor/schemas/vendor.schema';
import { LoginRequestDto } from './dto/login-request.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { verifyPassword } from '../../common/utils/password.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginRequestDto): Promise<TokenResponseDto> {
    const vendor = await this.vendorModel.findOne({ email: dto.email });
    if (!vendor) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValidPassword = verifyPassword(dto.password, vendor.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { vendorId: vendor._id.toString(), role: vendor.role };
    const accessToken = await this.jwtService.signAsync(payload);
    return {
      accessToken,
      expiresIn: 3600 * 24 * 30, // 30 days
      vendorId: vendor._id.toString(),
    };
  }
  async getVendorToken(vendorId: string): Promise<string> {
  const vendor = await this.vendorModel.findById(vendorId);
  if (!vendor) {
    throw new UnauthorizedException('Vendor not found');
  }
  const payload = { vendorId: vendor._id.toString(), role: vendor.role };
  return this.jwtService.sign(payload);
  }

  async validateToken(token: string): Promise<VendorDocument | null> {
    try {
      const decoded = this.jwtService.verify(token);
      return this.vendorModel.findById(decoded.vendorId);
    } catch {
      return null;
    }
  }
}
