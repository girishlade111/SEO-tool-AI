import { ContentRepository } from '@lade/database';
import { NotFoundError, ConflictError } from '@lade/shared';
import type { Content, PaginationParams, ContentType, ContentStatus } from '@lade/shared';
import { logger } from '@lade/config';
import { slugify } from '@lade/shared';

export class ContentService {
  constructor(private readonly contentRepo: ContentRepository) {}

  async list(projectId: string, params: PaginationParams & { type?: ContentType; status?: ContentStatus }) {
    return this.contentRepo.findByProjectId(projectId, params);
  }

  async getById(id: string): Promise<Content> {
    const content = await this.contentRepo.findById(id);
    if (!content || content.deletedAt) throw new NotFoundError('Content', id);
    return content;
  }

  async create(
    projectId: string,
    userId: string,
    data: {
      type: ContentType;
      title: string;
      content?: string;
      metaTitle?: string;
      metaDescription?: string;
      targetKeyword?: string;
    }
  ): Promise<Content> {
    const slug = slugify(data.title);

    return this.contentRepo.create({
      projectId,
      type: data.type,
      title: data.title,
      slug,
      status: 'draft',
      content: data.content ?? '',
      metaTitle: data.metaTitle ?? data.title,
      metaDescription: data.metaDescription ?? '',
      targetKeyword: data.targetKeyword ?? null,
      createdBy: userId,
      updatedBy: userId,
    });
  }

  async update(
    id: string,
    userId: string,
    data: Record<string, unknown>
  ): Promise<Content> {
    const content = await this.getById(id);
    return this.contentRepo.update(id, { ...data, updatedBy: userId });
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.contentRepo.softDelete(id);
  }

  async publish(id: string, userId: string): Promise<Content> {
    await this.getById(id);
    // Save current version before publishing
    const content = await this.getById(id);
    await this.contentRepo.createVersion({
      contentId: id,
      version: 1,
      content: content.content,
      metaTitle: content.metaTitle,
      metaDescription: content.metaDescription,
      changeNote: 'Published',
      createdBy: userId,
    });
    return this.contentRepo.publish(id);
  }

  async getVersions(contentId: string) {
    return this.contentRepo.getVersions(contentId);
  }
}
