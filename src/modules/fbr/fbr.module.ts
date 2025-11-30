import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { FbrController } from './fbr.controller';
import { FbrService } from './fbr.service';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [FbrController],
  providers: [FbrService],
  exports: [FbrService],
})
export class FbrModule {}
