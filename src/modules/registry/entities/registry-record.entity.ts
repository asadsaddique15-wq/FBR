import { RegistryStatus } from '../enums/registry-status.enum';

export interface RegistryRecord {
  vendorId: string;
  status: RegistryStatus;
  documentUrl: string;
  submittedBy: string;
  submittedAt: Date;
}
