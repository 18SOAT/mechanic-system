import { IdGenerator } from '../../../../shared/domain/id-generator.js';
import { Email } from '../../../../shared/domain/value-objects/email.vo.js';
import { UserType } from '../enums/user-type.enum.js';
import { PasswordHasher } from '../ports/password-hasher.port.js';

export class User {
  private constructor(
    private readonly id: string,
    private readonly email: Email,
    private readonly passwordHash: string,
    private readonly type: UserType,
    private readonly active: boolean,
  ) {}

  static create(input: {
    email: Email;
    hashedPassword: string;
    type: UserType;
  }): User {
    return new User(
      IdGenerator.generate(),
      input.email,
      input.hashedPassword,
      input.type,
      true,
    );
  }

  static restore(props: {
    id: string;
    email: string;
    hashedPassword: string;
    type: UserType;
    active: boolean;
  }): User {
    return new User(
      props.id,
      Email.create(props.email),
      props.hashedPassword,
      props.type,
      props.active,
    );
  }

  // O hasher entra como parâmetro (port do domain): a entity decide QUANDO comparar,
  // o adapter (bcrypt) decide COMO — sem lib de infraestrutura dentro do domain.
  verifyPassword(
    plainTextPassword: string,
    hasher: PasswordHasher,
  ): Promise<boolean> {
    return hasher.compare(plainTextPassword, this.passwordHash);
  }

  get idValue(): string {
    return this.id;
  }

  get emailValue(): string {
    return this.email.value;
  }

  get typeValue(): UserType {
    return this.type;
  }

  get isActive(): boolean {
    return this.active;
  }

  // Só pro Mapper persistir. O nome explícito deixa óbvio que não vai em Response DTO.
  get hashedPassword(): string {
    return this.passwordHash;
  }
}
