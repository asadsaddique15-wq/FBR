import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SecurityKeyAuthDto {
  @ApiProperty({ example: 'aBcD4E9kL0pQ', description: 'Vendor security key for authentication' })
  @IsString()
  @IsNotEmpty()
  securityKey: string;
}

