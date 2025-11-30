import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class LoginDto {
  @ApiProperty({ example: 'aBcD4E9kL0pQ', description: 'Vendor security key' })
  @IsString()
  @IsNotEmpty()
  securityKey: string;
}
