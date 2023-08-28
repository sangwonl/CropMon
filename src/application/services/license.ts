import { injectable } from 'inversify';

import type { License } from '@domain/models/license';

// import { TYPES } from '@di/types';
//
// import { TrayUpdaterState, UiDirector } from '@application/ports/director';
// import { LicenseManager } from '@application/ports/license';

@injectable()
export class LicenseService {
  constructor() {}

  async checkAndGetLicense(): Promise<License | null> {
    // const license = await this.licenseManager.retrieveLicense();
    // if (license?.validated) {
    //   this.uiDirector.updateTrayUpdater(TrayUpdaterState.Checkable);
    // } else {
    //   this.uiDirector.updateTrayUpdater(TrayUpdaterState.NonAvailable);
    // }
    // return license;

    // NOTE: 라이센스 체크를 스킵하기로 결정 (기존엔 라이센스 없으면 업데이트 메뉴 숨겼음)
    // 이 함수를 사용하는 곳에서는 validated 만 사용하는 것으로 보여 나머지는 빈값으로 채움
    return {
      validated: true,
      key: '',
      email: '',
      registeredAt: 0,
      lastCheckedAt: 0,
    };
  }
}
