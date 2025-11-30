import { BusinessType } from '../../../common/enums/business-type.enum';
import { VendorRole } from '../../../common/enums/vendor-role.enum';

export interface Vendor {
  id: string;
  displayName: string;
  gstNumber: string;
  address: string;
  email: string;
  contactPhone: string;
  businessType: BusinessType;
  role: VendorRole;
  passwordHash: string;
  isRegistered: boolean;
  posId?: string;
  integrationKey?: string;
  integrationSecret?: string;
  createdAt: Date;
  updatedAt: Date;
}
