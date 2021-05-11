/* eslint-disable import/prefer-default-export */

import { AssetResolverFunc } from '@presenters/common/asset';
import { isMac } from '@utils/process';

import { AppTray } from '.';

export class AppTrayBuilder {
  assetResolver: AssetResolverFunc;

  constructor(assetResolver: AssetResolverFunc) {
    this.assetResolver = assetResolver;
  }

  build(): AppTray {
    const iconName = isMac() ? 'icons/16x16.png' : 'icons/64x64.png';
    const iconPath = this.assetResolver(iconName);
    return isMac() ? AppTray.forMac(iconPath) : AppTray.forWindows(iconPath);
  }
}
