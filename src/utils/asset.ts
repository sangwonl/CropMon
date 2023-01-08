import path from 'path';

import { app } from 'electron';

const RESOURCES_PATH = app.isPackaged
  ? process.resourcesPath
  : path.join(__dirname, '../../');

export type AssetPathResolverFunc = (assetPath: string) => string;

export const assetPathResolver = (...assetPaths: string[]): string => {
  return path.join(RESOURCES_PATH, 'assets', ...assetPaths);
};

export const resourcePathResolver = (...assetPaths: string[]): string => {
  return path.join(RESOURCES_PATH, ...assetPaths);
};
