import bcrypt from 'bcryptjs';
import { UserRepository } from '@lade/database';
import { AppError, UnauthorizedError, ConflictError, NotFoundError } from '@lade/shared';
import { logger } from '@lade/config';
import type { User } from '@lade/shared';

const SALT_ROUNDS = 12;

export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}

  async register(email: string, password: string, name: string): Promise<User> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing && !existing.deletedAt) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.userRepo.create({ email, passwordHash, name });

    logger.info('User registered', { userId: user.id, email });
    return user as unknown as User;
  }

  async login(email: string, password: string): Promise<User> {
    const user = await this.userRepo.findByEmail(email);
    if (!user || user.deletedAt) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if ((user as unknown as { status: string }).status === 'suspended') {
      throw new UnauthorizedError('Account suspended');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return user as unknown as User;
  }

  async getUser(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user || user.deletedAt) {
      throw new NotFoundError('User', id);
    }
    return user as unknown as User;
  }

  async updateProfile(id: string, data: { name?: string; avatarUrl?: string | null }): Promise<User> {
    return this.userRepo.update(id, {
      ...data,
      avatarUrl: data.avatarUrl ?? undefined,
    }) as unknown as User;
  }

  async updatePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError('User', id);

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new AppError('INVALID_PASSWORD', 'Current password is incorrect', 400);
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.userRepo.updatePassword(id, newHash);
    logger.info('Password updated', { userId: id });
  }

  async verifyEmail(id: string): Promise<void> {
    await this.userRepo.verifyEmail(id);
  }

  async suspendUser(id: string): Promise<void> {
    await this.userRepo.suspend(id);
    logger.info('User suspended', { userId: id });
  }

  async activateUser(id: string): Promise<void> {
    await this.userRepo.activate(id);
    logger.info('User activated', { userId: id });
  }

  async deleteAccount(id: string): Promise<void> {
    await this.userRepo.softDelete(id);
    logger.info('User deleted', { userId: id });
  }
}
