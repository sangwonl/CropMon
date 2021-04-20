/* eslint-disable import/prefer-default-export */

import { app } from 'electron';
import path from 'path';

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../../assets');

export const assetResolver = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};
