import type { User } from '../../src/modules/user/domain/entities/user.entity.js';
import type { UserRepository } from '../../src/modules/user/domain/repositories/user.repository.js';

export class InMemoryUserRepository implements UserRepository {
  readonly items: User[] = [];

  async findById(id: string): Promise<User | null> {
    return this.items.find((user) => user.idValue === id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.items.find((user) => user.emailValue === email) ?? null;
  }
}
