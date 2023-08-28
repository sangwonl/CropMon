/* eslint-disable promise/always-return */

import { app, session, screen } from 'electron';
import Store from 'electron-store';
import { injectable } from 'inversify';
import Mixpanel from 'mixpanel';
import { v4 as uuidv4 } from 'uuid';

import { isDebugMode } from '@utils/process';

import type { AnalyticsTracker } from '@application/ports/tracker';

import { version as curVersion, productName, appId } from '../../package.json';

@injectable()
export default class MixPanelTracker implements AnalyticsTracker {
  store!: Store;
  mixpanel!: typeof Mixpanel;

  constructor() {
    this.store = new Store({
      name: 'session',
      fileExtension: 'json',
      accessPropertiesByDotNotation: false,
    });

    this.mixpanel = Mixpanel.init('a6c899ecfb1c503e9edac87a15374a7a', {
      debug: isDebugMode(),
    });
  }

  view(name: string): void {
    this.mixpanel.track('view', { ...this.getProperties(), view: name });
  }

  event(category: string, action: string): void {
    this.mixpanel.track(action, { ...this.getProperties(), category });
  }

  eventL(category: string, action: string, label: string): void {
    this.mixpanel.track(action, { ...this.getProperties(), category, label });
  }

  eventLV(
    category: string,
    action: string,
    label: string,
    value: string | number,
  ): void {
    this.mixpanel.track(action, {
      ...this.getProperties(),
      category,
      label,
      value,
    });
  }

  eventLVS(
    category: string,
    action: string,
    lvs: { [key: string]: string | number },
  ): void {
    this.mixpanel.track(action, {
      ...this.getProperties(),
      category,
      ...lvs,
    });
  }

  private getProperties(): { [key: string]: string } {
    return {
      distinct_id: this.getTrackUid(),
      product_name: productName,
      app_id: appId,
      app_version: curVersion,
      user_agent: session.defaultSession.getUserAgent(),
      locale: app.getLocale(),
      screens: this.getScreenResolution(),
    };
  }

  private getTrackUid(): string {
    let uid = this.store.get('tuid') as string;
    if (uid === undefined) {
      uid = uuidv4();
      this.store.set('tuid', uid);
    }
    return uid;
  }

  private getScreenResolution(): string {
    return screen
      .getAllDisplays()
      .map(({ bounds, scaleFactor: s }) => {
        const width = bounds.width * s;
        const height = bounds.height * s;
        return `${width}x${height}`;
      })
      .join(',');
  }
}
