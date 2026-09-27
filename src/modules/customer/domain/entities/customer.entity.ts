import { IdGenerator } from '../../../../shared/domain/id-generator.js';
import { Email } from '../../../../shared/domain/value-objects/email.vo.js';
import { Document } from '../value-objects/document.vo.js';
import { Phone } from '../value-objects/phone.vo.js';

export class Customer {
  private constructor(
    private readonly id: string,
    private readonly userId: string | null,
    private readonly name: string | null,
    private readonly document: Document,
    private readonly email: Email,
    private readonly phone: Phone | null,
  ) {}

  // Cadastro simplificado: o nome é completado depois do login.
  static create(input: {
    userId: string;
    document: Document;
    email: Email;
    phone: Phone;
  }): Customer {
    return new Customer(
      IdGenerator.generate(),
      input.userId,
      null,
      input.document,
      input.email,
      input.phone,
    );
  }

  static restore(props: {
    id: string;
    userId: string | null;
    name: string | null;
    document: string;
    email: string;
    phone: string | null;
  }): Customer {
    return new Customer(
      props.id,
      props.userId,
      props.name,
      Document.create(props.document),
      Email.create(props.email),
      props.phone ? Phone.create(props.phone) : null,
    );
  }

  get idValue(): string {
    return this.id;
  }

  get userIdValue(): string | null {
    return this.userId;
  }

  get nameValue(): string | null {
    return this.name;
  }

  get documentValue(): string {
    return this.document.value;
  }

  get emailValue(): string {
    return this.email.value;
  }

  get phoneValue(): string | null {
    return this.phone?.value ?? null;
  }
}
