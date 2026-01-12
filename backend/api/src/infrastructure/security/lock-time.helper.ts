export class LockTimeHelper {
  static lockUntil(minutes: number): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
  }
}
