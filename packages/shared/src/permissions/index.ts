export type Permission =
  | 'project:create'
  | 'project:read'
  | 'project:update'
  | 'project:delete'
  | 'project:archive'
  | 'project:invite'
  | 'project:remove_member'
  | 'analysis:trigger'
  | 'analysis:read'
  | 'analysis:delete'
  | 'keyword:create'
  | 'keyword:read'
  | 'keyword:update'
  | 'keyword:delete'
  | 'keyword:research'
  | 'keyword:cluster'
  | 'content:create'
  | 'content:read'
  | 'content:update'
  | 'content:delete'
  | 'content:publish'
  | 'content:generate'
  | 'ai:chat'
  | 'ai:generate'
  | 'ai:read_usage'
  | 'report:create'
  | 'report:read'
  | 'report:update'
  | 'report:delete'
  | 'report:export'
  | 'billing:read'
  | 'billing:update'
  | 'admin:users'
  | 'admin:audit'
  | 'admin:flags'
  | 'admin:config'
  | 'admin:stats';

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner: [
    'project:create', 'project:read', 'project:update', 'project:delete', 'project:archive',
    'project:invite', 'project:remove_member',
    'analysis:trigger', 'analysis:read', 'analysis:delete',
    'keyword:create', 'keyword:read', 'keyword:update', 'keyword:delete',
    'keyword:research', 'keyword:cluster',
    'content:create', 'content:read', 'content:update', 'content:delete', 'content:publish',
    'content:generate',
    'ai:chat', 'ai:generate', 'ai:read_usage',
    'report:create', 'report:read', 'report:update', 'report:delete', 'report:export',
    'billing:read', 'billing:update',
  ],
  editor: [
    'project:read',
    'analysis:trigger', 'analysis:read',
    'keyword:create', 'keyword:read', 'keyword:update', 'keyword:delete',
    'keyword:research', 'keyword:cluster',
    'content:create', 'content:read', 'content:update', 'content:delete', 'content:publish',
    'content:generate',
    'ai:chat', 'ai:generate', 'ai:read_usage',
    'report:create', 'report:read', 'report:update', 'report:delete', 'report:export',
  ],
  viewer: [
    'project:read',
    'analysis:read',
    'keyword:read',
    'content:read',
    'report:read',
  ],
  admin: [
    'project:create', 'project:read', 'project:update', 'project:delete', 'project:archive',
    'project:invite', 'project:remove_member',
    'analysis:trigger', 'analysis:read', 'analysis:delete',
    'keyword:create', 'keyword:read', 'keyword:update', 'keyword:delete',
    'keyword:research', 'keyword:cluster',
    'content:create', 'content:read', 'content:update', 'content:delete', 'content:publish',
    'content:generate',
    'ai:chat', 'ai:generate', 'ai:read_usage',
    'report:create', 'report:read', 'report:update', 'report:delete', 'report:export',
    'billing:read', 'billing:update',
    'admin:users', 'admin:audit', 'admin:flags', 'admin:config', 'admin:stats',
  ],
};
