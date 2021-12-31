/* eslint-disable import/prefer-default-export */

const TYPES = {
  ScreenRecorder: Symbol.for('ScreenRecorder'),
  PreferencesStore: Symbol.for('PreferencesStore'),
  AppUpdater: Symbol.for('AppUpdater'),
  UiDirector: Symbol.for('UiDirector'),
  UiStateApplier: Symbol.for('UiStateApplier'),
  AnalyticsTracker: Symbol.for('AnalyticsTracker'),
  ShortcutManager: Symbol.for('ShortcutManager'),
  HookManager: Symbol.for('HookManager'),
  Remote: Symbol.for('Remote'),
};

export { TYPES };
