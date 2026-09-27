import { v7 as uuidv7 } from 'uuid';

// UUID v7 é ordenável por tempo (prefixo de timestamp), o que mantém o índice
// da PK "append-only" no Postgres — inserts mais baratos que com v4 aleatório.
export class IdGenerator {
  static generate(): string {
    return uuidv7();
  }
}
