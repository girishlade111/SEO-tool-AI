import { ROLE_PERMISSIONS, ForbiddenError } from '@lade/shared';
import type { Permission, ProjectMemberRole } from '@lade/shared';

export class PermissionsService {
  hasPermission(role: ProjectMemberRole | 'admin', permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role];
    if (!permissions) return false;
    return permissions.includes(permission);
  }

  requirePermission(role: ProjectMemberRole | 'admin', permission: Permission): void {
    if (!this.hasPermission(role, permission)) {
      throw new ForbiddenError(`Missing required permission: ${permission}`);
    }
  }

  requireAnyPermission(role: ProjectMemberRole | 'admin', permissions: Permission[]): void {
    const hasAny = permissions.some((p) => this.hasPermission(role, p));
    if (!hasAny) {
      throw new ForbiddenError('Insufficient permissions');
    }
  }

  getRoleBasePermissions(role: ProjectMemberRole | 'admin'): Permission[] {
    return ROLE_PERMISSIONS[role] ?? [];
  }
}
