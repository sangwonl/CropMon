/* eslint-disable import/prefer-default-export */

import path from 'path';

import { app } from 'electron';
import staticFfmpegPath from 'ffmpeg-static';

import { isProduction, isWin } from './process';

export const getPathToFfmpeg = (): string => {
  return isProduction()
    ? path.join(
        app.getAppPath(),
        `../../3rdparty/ffmpeg/ffmpeg${isWin() ? '.exe' : ''}`
      )
    : staticFfmpegPath;
};
