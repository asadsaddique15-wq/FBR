import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber, Min, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @ApiProperty({ example: 'Product Name', description: 'Item name' })
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiProperty({ example: 2, description: 'Quantity' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 1000, description: 'Unit price' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ example: 18, description: 'Tax rate in percentage (default: 0)', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxRate?: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: 'aBcD4E9kL0pQ', description: 'Vendor security key for authentication', required: false })
  @IsString()
  @IsOptional()
  securityKey?: string;

  @ApiProperty({ example: 'John Doe', description: 'Customer name' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: '1234567890123', description: 'Customer CNIC (13 digits)' })
  @IsString()
  @IsNotEmpty()
  customerCNIC: string;

  @ApiProperty({ example: '123 Main Street, Karachi', description: 'Customer address' })
  @IsString()
  @IsNotEmpty()
  customerAddress: string;

  @ApiProperty({ type: [InvoiceItemDto], description: 'Invoice items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @ApiProperty({ example: '2024-01-15', description: 'Invoice date (ISO format)', required: false })
  @IsDateString()
  @IsOptional()
  invoiceDate?: string;

  @ApiProperty({ example: 'Cash', description: 'Payment method', required: false })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiProperty({ example: 'Additional notes', description: 'Invoice notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

