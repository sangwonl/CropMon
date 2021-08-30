/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable import/prefer-default-export */

import { app, session, screen } from 'electron';
import Store from 'electron-store';
import ua from 'universal-analytics';
import { injectable } from 'inversify';
import { v4 as uuidv4 } from 'uuid';

import { IAnalyticsTracker } from '@core/interfaces/tracker';

import { version as curVersion, productName, appId } from '../package.json';

@injectable()
export class GoogleAnalyticsTracker implements IAnalyticsTracker {
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
    app.whenReady().then(() => {
      this.tracker.set('ua', session.defaultSession.getUserAgent());
      this.tracker.set('ul', app.getLocale());
      this.tracker.set('sr', this.getScreenResolution());
    });
  }

  view(name: string): void {
    this.tracker.pageview(`/views/${name}`).send();
    this.tracker
      .screenview(`/views/${name}`, productName, curVersion, appId)
      .send();
  }

  event(category: string, action: string, cb?: () => void): void {
    this.tracker.event(category, action, cb).send();
  }

  eventL(
    category: string,
    action: string,
    label: string,
    cb?: () => void
  ): void {
    this.tracker.event(category, action, label, cb).send();
  }

  eventLV(
    category: string,
    action: string,
    label: string,
    value: number,
    cb?: () => void
  ): void {
    this.tracker.event(category, action, label, value, cb).send();
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
