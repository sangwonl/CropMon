/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/no-empty-interface */

import { injectable } from 'inversify';
import { ScreenRecorder } from '../../core/components';

@injectable()
export class ScreenRecorderImpl implements ScreenRecorder {}
