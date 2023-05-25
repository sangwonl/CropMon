/* eslint-disable @typescript-eslint/no-explicit-any */

export interface AnalyticsTracker {
  view(name: string): void;
  event(category: string, action: string): void;
  eventL(category: string, action: string, label: string): void;
  eventLV(category: string, action: string, label: string, value: number): void;
  eventLVS(category: string, action: string, lvs: any): void;
}
