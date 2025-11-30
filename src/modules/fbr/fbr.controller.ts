import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FbrService } from './fbr.service';

@ApiTags('FBR')
@Controller('fbr')
export class FbrController {
  constructor(private readonly fbrService: FbrService) {}

  @Get('ping')
  ping() {
    return { message: 'FBR module is active' };
  }
}
