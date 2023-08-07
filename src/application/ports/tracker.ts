/* eslint-disable no-unused-vars */

export interface AnalyticsTracker {
  view(name: string): void;
  event(category: string, action: string): void;
  eventL(category: string, action: string, label: string): void;
  eventLV(
    category: string,
    action: string,
    label: string,
    value: string | number,
  ): void;
  eventLVS(
    category: string,
    action: string,
    lvs: { [key: string]: string | number },
  ): void;
}
