/* eslint-disable import/prefer-default-export */

import { isMac } from '@utils/process';

import { AppTray } from '.';

type AssetResolverFunc = (path: string) => string;

export class AppTrayBuilder {
  assetResolver: AssetResolverFunc;

  constructor(assetResolver: AssetResolverFunc) {
    this.assetResolver = assetResolver;
  }

  build(): AppTray {
    const iconPath = this.assetResolver('icon.png');
    return isMac() ? AppTray.forMac(iconPath) : AppTray.forWindows(iconPath);
  }
}
