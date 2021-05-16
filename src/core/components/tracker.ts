/* eslint-disable import/prefer-default-export */

export interface IAnalyticsTracker {
  view(name: string): void;
  event(
    category: string,
    action: string,
    label?: string,
    value?: string | number
  ): void;
}
