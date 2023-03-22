const TYPES = {
  AppUpdater: Symbol.for('AppUpdater'),
  AppTray: Symbol.for('AppTray'),
  UiDirector: Symbol.for('UiDirector'),
  UiStateApplier: Symbol.for('UiStateApplier'),
  ScreenRecorder: Symbol.for('ScreenRecorder'),
  RecorderSource: Symbol.for('RecorderSource'),
  ActionDispatcher: Symbol.for('ActionDispatcher'),
  PreferencesStore: Symbol.for('PreferencesStore'),
  AnalyticsTracker: Symbol.for('AnalyticsTracker'),
  PlatformApi: Symbol.for('PlatformApi'),
  PreferencesRepository: Symbol.for('PreferencesRepository'),
  LicenseManager: Symbol.for('LicenseManager'),
};

export default TYPES;
