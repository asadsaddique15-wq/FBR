import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RegistryService } from './registry.service';
import { RegistryRequestDto } from './dto/registry-request.dto';

@ApiTags('Registry')
@Controller('registry')
export class RegistryController {
  constructor(private readonly registryService: RegistryService) {}

  @Post('request')
  async submit(@Body() dto: RegistryRequestDto) {
    return await this.registryService.submit(dto);
  }

  @Patch(':vendorId/approve')
  async approve(@Param('vendorId') vendorId: string) {
    return await this.registryService.approve(vendorId);
  }

  @Get(':vendorId/status')
  async status(@Param('vendorId') vendorId: string) {
    return await this.registryService.status(vendorId);
  }
}
