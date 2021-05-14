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

export const inferVideoCodec = (outputPath: string): string => {
  const ext = path.extname(outputPath);
  switch (ext) {
    case 'webm':
      return 'libvpx';
    case 'mp4':
      return 'libx264';
    default:
      return 'libx264';
  }
};
