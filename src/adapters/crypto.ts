import { safeStorage } from 'electron';
import { injectable } from 'inversify';

@injectable()
export class SafeCipher {
  encrypt<T>(data: T): string | null {
    try {
      const encrypted = safeStorage.encryptString(JSON.stringify(data));
      return encrypted.toString('base64');
    } catch (ignored) {
      return null;
    }
  }

  decrypt<T>(enryptedBase64: string): T | null {
    const encrypted = Buffer.from(enryptedBase64, 'base64');
    try {
      const decrypted = safeStorage.decryptString(encrypted);
      return JSON.parse(decrypted) as T;
    } catch (ignored) {
      return null;
    }
  }
}
