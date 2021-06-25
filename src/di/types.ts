/* eslint-disable import/prefer-default-export */

const TYPES = {
  MediaEncoder: Symbol.for('MediaEncoder'),
  FileManager: Symbol.for('FileManager'),
  ScreenRecorder: Symbol.for('ScreenRecorder'),
  PreferencesStore: Symbol.for('PreferencesStore'),
  AppUpdater: Symbol.for('AppUpdater'),
  UiDirector: Symbol.for('UiDirector'),
  UiStateApplier: Symbol.for('UiStateApplier'),
  AnalyticsTracker: Symbol.for('AnalyticsTracker'),
  HookManager: Symbol.for('HookManager'),
};

export { TYPES };
