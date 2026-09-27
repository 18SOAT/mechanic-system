import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { PasswordHasher } from '../../domain/ports/password-hasher.port.js';

// Cost 10 = 2^10 rounds: ~dezenas de ms por hash, lento o bastante pra encarecer
// força bruta offline sem pesar no login.
const SALT_ROUNDS = 10;

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  hash(plainTextPassword: string): Promise<string> {
    return bcrypt.hash(plainTextPassword, SALT_ROUNDS);
  }

  compare(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }
}
