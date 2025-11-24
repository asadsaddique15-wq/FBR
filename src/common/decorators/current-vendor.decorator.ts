import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { VendorDocument } from '../../modules/vendor/schemas/vendor.schema';
/**
 * Injects the authenticated vendor (populated by {@link AuthGuard}) into the
 * controller handler so we do not have to manually read the request object.
 */
export const CurrentVendor = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): VendorDocument => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { vendor?: VendorDocument }>();
    return request.vendor as VendorDocument;
  },
);
