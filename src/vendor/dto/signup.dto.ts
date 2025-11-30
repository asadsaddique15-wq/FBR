import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty, IsEmail, Length, IsNumber, Min } from 'class-validator';
import { BusinessCategory } from '../enums/business-category.enum';
export class SignupDto {
  @ApiProperty({ example: 'Asad', description: 'Vendor first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Siddique', description: 'Vendor last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '', description: 'CNIC - 13 digits' })
  @IsString()
  @Length(13, 13)
  cnic: string;

  @ApiProperty({ example: '', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '', description: 'Phone number - 11 digits' })
  @IsString()
  @Length(11, 11)
  phone: string;

  @ApiProperty({ example: 30, description: 'Age' })
  @IsNumber()
  @Min(18)
  age: number;

  @ApiProperty({ enum: BusinessCategory, description: 'Select a business category' })
  @IsEnum(BusinessCategory)
  businessCategory: BusinessCategory;

  @ApiProperty({ example: '', description: 'Company name' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ example: '', description: 'Company address' })
  @IsString()
  @IsNotEmpty()
  companyAddress: string;

  @ApiProperty({ example: 'https://example.com/docs/ownership.pdf', description: 'Ownership document URL' })
  @IsString()
  @IsNotEmpty()
  ownershipDocumentUrl: string;
}
