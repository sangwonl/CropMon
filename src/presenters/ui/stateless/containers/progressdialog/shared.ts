/* eslint-disable @typescript-eslint/no-empty-interface */

export interface ProgressDialogButtons {
  cancelTitle: string;
  actionTitle: string;
  actionHideInProgress: boolean;
}

export interface ProgressDialogOptions {
  title: string;
  message: string;
  buttons: ProgressDialogButtons;
  timeout?: number;
  width?: number;
  height?: number;
}

export const IPC_EVENT_SET_PROGRESS = 'set-progress';
export const IPC_EVENT_ON_ACTION_BTN_CLICK = 'on-action-btn-click';
export const IPC_EVENT_ON_CANCEL_BTN_CLICK = 'on-cancel-btn-click';

export interface IpcEventSetProgress {
  progress: number;
}
