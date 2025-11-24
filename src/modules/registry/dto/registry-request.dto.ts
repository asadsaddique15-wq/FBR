import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegistryRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  documentUrl: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  submittedBy: string;
}
