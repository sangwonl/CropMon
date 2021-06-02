/* eslint-disable @typescript-eslint/no-empty-interface */

export interface ProgressDialogButton {
  title: string;
  enabled: boolean;
  enableOnCompletion: boolean;
}

export interface ProgressDialogOptions {
  title: string;
  message: string;
  button: ProgressDialogButton;
  timeout?: number;
}

export const IPC_EVENT_SET_PROGRESS = 'set-progress';
export const IPC_EVENT_ON_BUTTON_CLICK = 'on-button-click';

export interface IpcEventSetProgress {
  progress: number;
}

export interface IpcEventOnButtonClick {}
