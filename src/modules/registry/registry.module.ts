import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RegistryController } from './registry.controller';
import { RegistryService } from './registry.service';
import { RegistryDocument, RegistrySchema } from './schemas/registry.schema';
import { VendorModule } from '../vendor/vendor.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RegistryDocument.name, schema: RegistrySchema, collection: 'registries' },
    ]),
    VendorModule,
  ],
  controllers: [RegistryController],
  providers: [RegistryService],
  exports: [RegistryService],
})
export class RegistryModule {}
