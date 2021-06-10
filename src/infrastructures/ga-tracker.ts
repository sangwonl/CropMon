/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable import/prefer-default-export */

import ua from 'universal-analytics';
import { injectable } from 'inversify';
import Store from 'electron-store';
import { v4 as uuidv4 } from 'uuid';

import { IAnalyticsTracker } from '@core/components/tracker';

import { version as curVersion, productName } from '../package.json';

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
  }

  private getTrackUid(): string {
    let uid = this.store.get('tuid') as string;
    if (uid === undefined) {
      uid = uuidv4();
      this.store.set('tuid', uid);
    }
    return uid;
  }

  view(name: string): void {
    this.tracker.pageview(`/views/${name}`).send();
    this.tracker.screenview(`/views/${name}`, productName, curVersion).send();
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
}
