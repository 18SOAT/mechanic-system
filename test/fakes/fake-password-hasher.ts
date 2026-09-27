import type { PasswordHasher } from '../../src/modules/user/domain/ports/password-hasher.port.js';

// Hash reversível e previsível: o teste foca na regra, não no bcrypt.
export class FakePasswordHasher implements PasswordHasher {
  compareCalls = 0;

  async hash(plainTextPassword: string): Promise<string> {
    return `hashed:${plainTextPassword}`;
  }

  async compare(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    this.compareCalls++;
    return hashedPassword === `hashed:${plainTextPassword}`;
  }
}
