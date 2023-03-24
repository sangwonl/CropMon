import { safeStorage } from 'electron';
import Store from 'electron-store';
import { injectable } from 'inversify';

@injectable()
export default class SecureStore {
  private store: Store;

  constructor() {
    this.store = new Store({
      name: 'sstore',
      fileExtension: 'json',
      accessPropertiesByDotNotation: false,
    });
  }

  set<T>(key: string, data: T): boolean {
    try {
      const encrypted = safeStorage.encryptString(JSON.stringify(data));
      this.store.set(key, encrypted.toString('base64'));
    } catch (ignored) {
      return false;
    }
    return true;
  }

  get<T>(key: string): T | null {
    const loaded = this.store.get(key) as string;
    const encrypted = Buffer.from(loaded, 'base64');
    try {
      const decrypted = safeStorage.decryptString(encrypted);
      return JSON.parse(decrypted) as T;
    } catch (ignored) {
      return null;
    }
  }
}
