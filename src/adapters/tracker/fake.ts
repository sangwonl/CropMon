import logger from 'electron-log';
import { injectable } from 'inversify';

import type { AnalyticsTracker } from '@application/ports/tracker';

@injectable()
export class FakeTracker implements AnalyticsTracker {
  constructor() {}

  view(name: string): void {
    logger.debug(`tracker (view): ${name}`);
  }

  event(category: string, action: string): void {
    logger.debug(`tracker (event): ${category} ${action}`);
  }

  eventL(category: string, action: string, label: string): void {
    logger.debug(`tracker (eventL): ${category} ${action} ${label}`);
  }

  eventLV(
    category: string,
    action: string,
    label: string,
    value: string | number,
  ): void {
    logger.debug(`tracker (eventLV): ${category} ${action} ${label} ${value}`);
  }

  eventLVS(
    category: string,
    action: string,
    lvs: { [key: string]: string | number },
  ): void {
    logger.debug(`tracker (eventLVS): ${category} ${action} ${lvs}`);
  }
}
