/* eslint-disable import/prefer-default-export */

import path from 'path';

import { app } from 'electron';

import { getArch, getPlatform, isProduction, isWin } from './process';

export const getPathToFfmpeg = (): string => {
  const executable = `ffmpeg${isWin() ? '.exe' : ''}`;
  const prodPath = `../../3rdparty/ffmpeg/${executable}`;
  const devPath = `../../3rdparty/ffmpeg/${getPlatform()}/${getArch()}/${executable}`;

  return isProduction()
    ? path.join(app.getAppPath(), prodPath)
    : path.join(__dirname, devPath);
};

export const inferVideoCodec = (outputPath: string): string => {
  const ext = path.extname(outputPath);
  switch (ext) {
    case '.webm':
      return 'libvpx-vp9';
    case '.mp4':
      return 'libx264';
    default:
      return 'libx264';
  }
};
