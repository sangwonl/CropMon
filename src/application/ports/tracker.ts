/* eslint-disable prettier/prettier */

export interface AnalyticsTracker {
  view(name: string): void;
  event(category: string, action: string, cb?: () => void): void;
  eventL(category: string, action: string, label: string, cb?: () => void): void;
  eventLV(category: string, action: string, label: string, value: number, cb?: () => void): void;
}
