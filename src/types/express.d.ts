import { VendorDocument } from '../modules/vendor/schemas/vendor.schema';

declare module 'express-serve-static-core' {
  interface Request {
    vendor?: VendorDocument;
    token?: string;
  }
}
