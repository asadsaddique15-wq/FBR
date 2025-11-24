import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { VendorModule } from './modules/vendor/vendor.module';
import { AuthModule } from './modules/auth/auth.module';
import { RegistryModule } from './modules/registry/registry.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { FbrModule } from './modules/fbr/fbr.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    VendorModule,
    AuthModule,
    RegistryModule,
    InvoiceModule,
    FbrModule,
  ],
})
export class AppModule {}
