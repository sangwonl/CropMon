import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { CaptureOptions } from '@domain/models/capture';
import { License } from '@domain/models/license';
import { Preferences } from '@domain/models/preferences';
import { Bounds, Point } from '@domain/models/screen';

import { UiState } from '@application/models/ui';
import { UseCaseInteractor } from '@application/ports/interactor';

@injectable()
export default class UseCaseInteractorForMain implements UseCaseInteractor {
  constructor(
    @inject(TYPES.UseCaseInteractor) private interactor: UseCaseInteractor
  ) {
    ipcMain.on('disableCaptureMode', () => this.disableCaptureMode());
    ipcMain.on(
      'startTargetSelection',
      (_event, targetBounds, cursorPosition): void => {
        this.startTargetSelection(targetBounds, cursorPosition);
      }
    );
    ipcMain.on(
      'selectingTarget',
      (_event, targetBounds, cursorPosition): void => {
        this.selectingTarget(targetBounds, cursorPosition);
      }
    );
    ipcMain.on('finishTargetSelection', (_event, targetBounds): void => {
      this.finishTargetSelection(targetBounds);
    });
    ipcMain.on('startCapture', () => this.startCapture());
    ipcMain.on('changeCaptureOptions', (_event, options) => {
      this.changeCaptureOptions(options);
    });
    ipcMain.on('getUiState', (event) => {
      event.returnValue = this.getUiState();
    });
    ipcMain.handle('savePreferences', async (event, prefs: Preferences) => {
      return this.savePreferences(prefs);
    });
    ipcMain.handle('getLicense', async (event) => {
      return this.getLicense();
    });
    ipcMain.handle('registerLicense', async (event, email, licenseKey) => {
      return this.registerLicense(email, licenseKey);
    });
  }

  initializeApp(): void {
    throw new Error('Method not implemented.');
  }

  checkForUpdates(): void {
    throw new Error('Method not implemented.');
  }

  downloadAndInstall(): void {
    throw new Error('Method not implemented.');
  }

  showHelp(): void {
    throw new Error('Method not implemented.');
  }

  quitApplication(): void {
    throw new Error('Method not implemented.');
  }

  openPreferences(): void {
    throw new Error('Method not implemented.');
  }

  openCaptureFolder(): void {
    this.interactor.openCaptureFolder();
  }

  enableCaptureMode(): void {
    throw new Error('Method not implemented.');
  }

  disableCaptureMode(): void {
    this.interactor.disableCaptureMode();
  }

  changeCaptureOptions(options: CaptureOptions): void {
    this.interactor.changeCaptureOptions(options);
  }

  startTargetSelection(targetBounds: Bounds, cursorPosition: Point): void {
    this.interactor.startTargetSelection(targetBounds, cursorPosition);
  }

  selectingTarget(targetBounds: Bounds, cursorPosition: Point): void {
    this.interactor.selectingTarget(targetBounds, cursorPosition);
  }

  finishTargetSelection(targetBounds: Bounds): void {
    this.interactor.finishTargetSelection(targetBounds);
  }

  startCapture(): void {
    this.interactor.startCapture();
  }

  startCaptureWithCurrentStates(): void {
    throw new Error('Method not implemented.');
  }

  finishCapture(): void {
    throw new Error('Method not implemented.');
  }

  onCaptureToggleShortcut(): void {
    throw new Error('Method not implemented.');
  }

  getUiState(): UiState {
    return this.interactor.getUiState();
  }

  savePreferences(prefs: Preferences): Promise<Preferences> {
    return this.interactor.savePreferences(prefs);
  }

  getLicense(): Promise<License | null> {
    return this.interactor.getLicense();
  }

  registerLicense(email: string, licenseKey: string): Promise<License | null> {
    return this.interactor.registerLicense(email, licenseKey);
  }
}
