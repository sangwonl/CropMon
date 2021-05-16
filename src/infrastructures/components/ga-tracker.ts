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

  event(
    category: string,
    action: string,
    label?: string,
    value?: string | number
  ): void {
    if (label !== undefined && value !== undefined) {
      this.tracker.event(category, action, label, value).send();
    }
    this.tracker.event(category, action).send();
  }
}
