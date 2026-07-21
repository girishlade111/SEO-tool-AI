import { ProjectRepository } from '@lade/database';
import { NotFoundError, ForbiddenError, ConflictError } from '@lade/shared';
import type { Project, PaginationParams, ProjectMemberRole, ProjectSettings } from '@lade/shared';
import { logger } from '@lade/config';
import { PermissionsService } from '../auth/permissions.service';

export class ProjectService {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly permissions: PermissionsService
  ) {}

  async list(userId: string, params: PaginationParams & { status?: string }) {
    return this.projectRepo.findByUserId(userId, params);
  }

  async getById(id: string, userId: string, userRole: string): Promise<Project> {
    const project = await this.projectRepo.findById(id);
    if (!project || project.deletedAt) {
      throw new NotFoundError('Project', id);
    }
    this.ensureAccess(project as unknown as Project, userId, userRole);
    return project as unknown as Project;
  }

  async create(
    userId: string,
    data: { name: string; domain: string; description?: string; settings?: Partial<ProjectSettings> }
  ): Promise<Project> {
    const existing = await this.projectRepo.findByDomain(data.domain);
    if (existing && !existing.deletedAt) {
      throw new ConflictError('A project with this domain already exists');
    }

    const project = await this.projectRepo.create({
      name: data.name,
      domain: data.domain,
      description: data.description ?? null,
      settings: data.settings ?? null,
      userId,
    });

    await this.projectRepo.addMember(project.id, userId, 'owner');
    logger.info('Project created', { projectId: project.id, userId });
    return project as unknown as Project;
  }

  async update(id: string, userId: string, userRole: string, data: Record<string, unknown>): Promise<Project> {
    const project = await this.getById(id, userId, userRole);
    this.permissions.requirePermission(
      this.getUserRole(project, userId, userRole),
      'project:update'
    );
    return this.projectRepo.update(id, data) as unknown as Project;
  }

  async delete(id: string, userId: string, userRole: string): Promise<void> {
    const project = await this.getById(id, userId, userRole);
    this.permissions.requirePermission(
      this.getUserRole(project, userId, userRole),
      'project:delete'
    );
    await this.projectRepo.softDelete(id);
    logger.info('Project deleted', { projectId: id, userId });
  }

  async archive(id: string, userId: string, userRole: string): Promise<Project> {
    const project = await this.getById(id, userId, userRole);
    this.permissions.requirePermission(
      this.getUserRole(project, userId, userRole),
      'project:archive'
    );
    return this.projectRepo.archive(id) as unknown as Project;
  }

  async restore(id: string, userId: string, userRole: string): Promise<Project> {
    return this.projectRepo.restore(id) as unknown as Project;
  }

  async addMember(projectId: string, userId: string, userRole: string, memberEmail: string, memberRole: ProjectMemberRole) {
    const project = await this.getById(projectId, userId, userRole);
    this.permissions.requirePermission(
      this.getUserRole(project, userId, userRole),
      'project:invite'
    );
    // In real app, would look up user by email and add them
    return this.projectRepo.addMember(projectId, memberEmail, memberRole);
  }

  async getMembers(projectId: string, userId: string, userRole: string) {
    await this.getById(projectId, userId, userRole);
    return this.projectRepo.getMembers(projectId);
  }

  private ensureAccess(project: Project, userId: string, userRole: string): void {
    if (userRole === 'admin') return;
    const memberRole = this.getUserRole(project, userId, userRole);
    if (!memberRole) throw new ForbiddenError('Not a project member');
  }

  private getUserRole(project: Project, userId: string, userRole: string): ProjectMemberRole | 'admin' {
    if (userRole === 'admin') return 'admin';
    if (project.userId === userId) return 'owner';
    return 'viewer';
  }
}
