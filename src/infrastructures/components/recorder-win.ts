/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { screen } from 'electron';

import { ChildProcess } from 'child_process';
import Ffmpeg from 'fluent-ffmpeg';

import { injectable } from 'inversify';
import { ScreenRecorder } from '../../core/components';
import { CaptureContext } from '../../core/entities/capture';

interface ScreenBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

@injectable()
export class ScreenRecorderWindows implements ScreenRecorder {
  // eslint-disable-next-line class-methods-use-this
  async record(ctx: CaptureContext): Promise<void> {
    const { screenIndex } = ctx.target;

    const screenBounds = this.calcAllScreenBounds();
    const { x, y, width, height } = screenBounds[screenIndex];

    const ffmpeg = Ffmpeg()
      .input('desktop')
      .inputFormat('gdigrab')
      .inputOptions([
        '-framerate 30',
        `-offset_x ${x}`,
        `-offset_y ${y}`,
        `-video_size ${width}x${height}`,
      ])
      .videoCodec('libx264')
      .withVideoFilter('pad=ceil(iw/2)*2:ceil(ih/2)*2')
      .withOptions(['-pix_fmt yuv420p'])
      .save('output.mp4');

    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const proc = (ffmpeg as any).ffmpegProc as ChildProcess;
      proc?.stdin?.write('q');
    }, 5000);
  }

  private calcAllScreenBounds(): Array<ScreenBounds> {
    const displays = screen.getAllDisplays();
    const primaryScaleFactor = displays[0].scaleFactor;

    return displays.map((d) => {
      const { x, y, width, height } = d.bounds;
      let scaledX = x * primaryScaleFactor;
      if (scaledX < 0) {
        scaledX += width;
      }
      let scaledY = y * primaryScaleFactor;
      if (scaledY < 0) {
        scaledY += height;
      }
      return {
        x: scaledX,
        y: scaledY,
        width: width * d.scaleFactor,
        height: height * d.scaleFactor,
      };
    });
  }
}
