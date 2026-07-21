import { AdminRepository } from '@lade/database';
import type { PaginationParams, UserStatus, UserRole } from '@lade/shared';
import { logger } from '@lade/config';

export class AdminService {
  constructor(private readonly adminRepo: AdminRepository) {}

  async listUsers(params: PaginationParams & { status?: UserStatus; role?: UserRole; search?: string }) {
    return this.adminRepo.listUsers(params);
  }

  async getUser(id: string) {
    return this.adminRepo.getUserById(id);
  }

  async updateUser(id: string, data: { name?: string; role?: UserRole; status?: UserStatus }) {
    logger.info('Admin updated user', { targetUserId: id, data });
    return this.adminRepo.updateUser(id, data);
  }

  async getStats() {
    return this.adminRepo.getStats();
  }

  async getAuditLogs(params: PaginationParams & { userId?: string; entity?: string; action?: string }) {
    return this.adminRepo.getAuditLogs(params);
  }

  async getFeatureFlags() {
    return this.adminRepo.getFeatureFlags();
  }

  async updateFeatureFlag(id: string, data: { enabled?: boolean; rules?: Record<string, unknown> }) {
    return this.adminRepo.updateFeatureFlag(id, data);
  }
}
