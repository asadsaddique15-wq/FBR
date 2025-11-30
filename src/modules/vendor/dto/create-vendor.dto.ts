import { ApiProperty } from '@nestjs/swagger';
import {IsEmail,IsEnum,IsNotEmpty,IsOptional,IsString,MinLength,} from 'class-validator';
import { BusinessType } from '../../../common/enums/business-type.enum';
import { VendorRole } from '../../../common/enums/vendor-role.enum';

export class CreateVendorDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  gstNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contactPhone: string;

  @ApiProperty({ enum: BusinessType, required: false })
  @IsEnum(BusinessType)
  @IsOptional()
  businessType?: BusinessType;

  @ApiProperty({ enum: VendorRole, required: false, default: VendorRole.USER })
  @IsEnum(VendorRole)
  @IsOptional()
  role?: VendorRole;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
