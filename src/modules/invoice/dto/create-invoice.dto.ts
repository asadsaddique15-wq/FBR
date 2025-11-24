import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BuyerDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  ntn: string;

  @ApiProperty()
  @IsString()
  address: string;
}

class InvoiceItemDto {
  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNumber()
  taxRate: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  posId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  dateTime?: string;

  @ApiProperty({ type: BuyerDto })
  @ValidateNested()
  @Type(() => BuyerDto)
  buyer: BuyerDto;

  @ApiProperty({ type: [InvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @ApiProperty()
  @IsNumber()
  totalAmount: number;

  @ApiProperty()
  @IsString()
  currency: string;
}
