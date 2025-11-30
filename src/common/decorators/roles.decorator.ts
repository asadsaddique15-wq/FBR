import { SetMetadata } from '@nestjs/common';
import { VendorRole } from '../enums/vendor-role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: VendorRole[]) => SetMetadata(ROLES_KEY, roles);
