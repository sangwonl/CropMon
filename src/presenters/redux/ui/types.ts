/* eslint-disable @typescript-eslint/no-empty-interface */

export interface IPreferences {
  show: boolean;
  recordHomeDir: string;
  shouldOpenRecordHomeDir: boolean;
}

export interface IUiState {
  preferences: IPreferences;
}

export interface IPayloadChooseRecordHomeDir {
  recordHomeDir: string;
}
