import {CanActivate,ExecutionContext,Injectable,ForbiddenException,} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { VendorRole } from '../enums/vendor-role.enum';
import { VendorDocument } from '../../modules/vendor/schemas/vendor.schema';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<VendorRole[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];
    if (!requiredRoles.length) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request & { vendor?: VendorDocument }>();
    const vendor = request.vendor;
    if (!vendor || !requiredRoles.includes(vendor.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
