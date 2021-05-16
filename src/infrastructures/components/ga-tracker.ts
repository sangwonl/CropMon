/* eslint-disable import/prefer-default-export */

import ua from 'universal-analytics';
import { injectable } from 'inversify';

import { IAnalyticsTracker } from '@core/components/tracker';

@injectable()
export class GoogleAnalyticsTracker implements IAnalyticsTracker {
  tracker!: ua.Visitor;

  constructor() {
    this.tracker = ua('UA-197078322-1');
  }

  view(name: string): void {
    this.tracker.pageview(`/views/${name}`).send();
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
