import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { VendorRole } from '../../common/enums/vendor-role.enum';

@ApiTags('Vendors')
@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post('register')
  @ApiOperation({ summary: 'Self-service vendor registration' })
  async register(@Body() dto: CreateVendorDto) {
    return await this.vendorService.create(dto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(VendorRole.ADMIN)
  @Get()
  async findAll() {
    return await this.vendorService.findAll();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(VendorRole.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.vendorService.findOne(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(VendorRole.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateVendorDto) {
    return await this.vendorService.update(id, dto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(VendorRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.vendorService.remove(id);
    return { id, deleted: true };
  }
}
