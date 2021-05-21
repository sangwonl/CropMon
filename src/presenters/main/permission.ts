/* eslint-disable import/prefer-default-export */

import * as permUtils from 'mac-screen-capture-permissions';

import { isMac } from '@utils/process';

export const initializePermissions = () => {
  if (!isMac()) {
    return;
  }

  if (permUtils.hasScreenCapturePermission()) {
    return;
  }

  permUtils.openSystemPreferences();
};
