import type { License } from '@domain/models/license';

// Usecase #1: 입력한 라이센스키의 유효성을 검사
// Usecase #2: 라이센스 정보를 (암호화하여) 로컬에 저장
// Usecase #3: 로컬에 저장된 라이센스 정보를 불러옴
export interface LicenseManager {
  validateLicenseKey(
    email: string,
    licenseKey: string,
  ): Promise<License | null>;
  storeLicense(license: License): Promise<void>;
  retrieveLicense(): Promise<License | null>;
}
