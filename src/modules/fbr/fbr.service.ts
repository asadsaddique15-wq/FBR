import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';

interface FbrResponse<T> {
  data: T;
  correlationId: string;
}

interface FbrCredentialsPayload {
  token: string;
  posId: string;
  integrationKey: string;
  integrationSecret: string;
}

@Injectable()
export class FbrService {
  private readonly logger = new Logger(FbrService.name);

  constructor() {}

  //returns a dummy correlationId, QR code, and digital signature
  async post<T>(
    path: string,
    payload: unknown,
    credentials: FbrCredentialsPayload,
  ): Promise<FbrResponse<T>> {
    this.logger.debug(
      `Mock posting to FBR sandbox: ${path} using POS ${credentials.posId}`,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    const correlationId = randomBytes(8).toString('hex');
    if (path === '/invoices/register') {
      const response: any = {
        status: 'ACCEPTED', //or 'rejected' to test failure
        qrCode: Buffer.from('DUMMY_QR_CODE').toString('base64'),
        digitalSignature: randomBytes(64).toString('hex'),
      };
      return {
        data: response,
        correlationId,
      } as FbrResponse<T>;
    }
    return {
      data: {} as T,
      correlationId,
    };
  }
}
