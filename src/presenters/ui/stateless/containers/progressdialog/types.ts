/* eslint-disable @typescript-eslint/no-empty-interface */

export interface ProgressDialogButton {
  title: string;
  enabled: boolean;
  enableOnCompletion: boolean;
}

export interface ProgressDialogLayout {
  width: number;
  height: number;
}

export interface ProgressDialogOptions {
  title: string;
  message: string;
  button: ProgressDialogButton;
  layout?: ProgressDialogLayout;
  timeout?: number;
}

export interface IpcEventDataSetProgress {
  percent: number;
}

export interface IpcEventDataProgressDone {}
