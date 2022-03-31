const TYPES = {
  AppUpdater: Symbol.for('AppUpdater'),
  UiDirector: Symbol.for('UiDirector'),
  UiStateApplier: Symbol.for('UiStateApplier'),
  ScreenRecorder: Symbol.for('ScreenRecorder'),
  ActionDispatcher: Symbol.for('ActionDispatcher'),
  PreferencesStore: Symbol.for('PreferencesStore'),
  AnalyticsTracker: Symbol.for('AnalyticsTracker'),
  PlatformApi: Symbol.for('PlatformApi'),
};

export default TYPES;
