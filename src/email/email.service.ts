import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {}
  async sendVendorEmail(to: string, subject: string, text: string) {
    try {
      // create transporter using SMTP config from .env
      const transporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
        port: Number(this.configService.get<string>('SMTP_PORT')) || 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: this.configService.get<string>('SMTP_USER') || 'chelseafan21qqq@gmail.com',
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });

      const info = await transporter.sendMail({
        from: `"FBR Digital" <${this.configService.get<string>('SMTP_USER') || 'chelseafan21qqq@gmail.com'}>`,
        to,
        subject,
        text,
      });
      return info;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
