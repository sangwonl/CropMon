/* eslint-disable promise/always-return */

import { app, session, screen } from 'electron';
import Store from 'electron-store';
import { injectable } from 'inversify';
import ua from 'universal-analytics';
import { v4 as uuidv4 } from 'uuid';

import type { AnalyticsTracker } from '@application/ports/tracker';

import { version as curVersion, productName, appId } from '../../package.json';

@injectable()
export default class GoogleAnalyticsTracker implements AnalyticsTracker {
  store!: Store;
  tracker!: ua.Visitor;

  constructor() {
    this.store = new Store({
      name: 'session',
      fileExtension: 'json',
      accessPropertiesByDotNotation: false,
    });

    this.tracker = ua('UA-197078322-1', this.getTrackUid());
    this.tracker.set('aid', appId);
    this.tracker.set('an', productName);
    this.tracker.set('av', curVersion);
    app
      .whenReady()
      .then(() => {
        this.tracker.set('ua', session.defaultSession.getUserAgent());
        this.tracker.set('ul', app.getLocale());
        this.tracker.set('sr', this.getScreenResolution());
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .catch(_e => {});
  }

  view(name: string): void {
    this.tracker.pageview(`/views/${name}`).send();
    this.tracker
      .screenview(`/views/${name}`, productName, curVersion, appId)
      .send();
  }

  event(category: string, action: string): void {
    this.tracker.event(category, action).send();
  }

  eventL(category: string, action: string, label: string): void {
    this.tracker.event(category, action, label).send();
  }

  eventLV(
    category: string,
    action: string,
    label: string,
    value: string | number,
  ): void {
    this.tracker.event(category, action, label, value).send();
  }

  eventLVS(
    category: string,
    action: string,
    lvs: { [key: string]: string | number },
  ): void {
    Object.keys(lvs).forEach(k => {
      this.tracker.event(category, action, k, lvs[k]).send();
    });
  }

  private getTrackUid(): string {
    let uid = this.store.get('tuid') as string;
    if (uid === undefined) {
      uid = uuidv4();
      this.store.set('tuid', uid);
    }
    return uid;
  }

  private getScreenResolution = (): string =>
    screen
      .getAllDisplays()
      .map(({ bounds, scaleFactor: s }) => {
        const width = bounds.width * s;
        const height = bounds.height * s;
        return `${width}x${height}`;
      })
      .join(',');
}
