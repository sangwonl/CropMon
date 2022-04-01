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

export const IPC_EVT_SET_PROGRESS = 'set-progress';
export const IPC_EVT_ON_ACTION = 'on-action';
export const IPC_EVT_ON_CANCEL = 'on-cancel';

export interface IpcEvtSetProgress {
  progress: number;
}
