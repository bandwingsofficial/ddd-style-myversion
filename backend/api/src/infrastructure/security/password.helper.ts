import * as bcrypt from 'bcrypt';

export class PasswordHelper {
  static async hash(
    password: string,
    saltRounds: number,
  ): Promise<string> {
    return bcrypt.hash(password, saltRounds);
  }

  static async verify(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
