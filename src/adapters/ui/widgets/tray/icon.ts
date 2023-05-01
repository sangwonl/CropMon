import { nativeImage, NativeImage } from 'electron';

import { assetPathResolver } from '@utils/asset';
import { isMac } from '@utils/process';

export type TrayIconType = 'default' | 'recording' | 'updatable';

export default class TrayIconProvider {
  private iconCaches: { [key: string]: NativeImage } = {};

  icon(iconType: TrayIconType): NativeImage {
    const iconPath = `icon-tray-${iconType}.png`;

    let iconImage: NativeImage = this.iconCaches[iconPath];
    if (!iconImage) {
      iconImage = nativeImage.createFromPath(assetPathResolver(iconPath));
      if (isMac()) {
        iconImage = iconImage.resize({ width: 18, height: 18 });
        iconImage.setTemplateImage(true);
      }
      this.iconCaches[iconPath] = iconImage;
    }

    return iconImage;
  }
}
