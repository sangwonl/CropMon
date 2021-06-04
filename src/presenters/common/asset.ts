/* eslint-disable import/prefer-default-export */

import { app } from 'electron';
import path from 'path';

const RESOURCES_PATH = app.isPackaged
  ? process.resourcesPath
  : path.join(__dirname, '../../../');

export type AssetResolverFunc = (path: string) => string;

export const assetResolver = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, 'assets', ...paths);
};

export const resourceResolver = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};
