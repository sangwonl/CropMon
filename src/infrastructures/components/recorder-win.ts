/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */

import assert from 'assert';

import { Display, screen } from 'electron';
import { ChildProcess } from 'child_process';
import Ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import { injectable } from 'inversify';

import { ICaptureContext } from '@core/entities/capture';
import { IBounds } from '@core/entities/screen';
import { IScreenRecorder } from '@core/components';

@injectable()
export class ScreenRecorderWindows implements IScreenRecorder {
  lastFfmpeg!: FfmpegCommand;

  // eslint-disable-next-line class-methods-use-this
  async record(ctx: ICaptureContext): Promise<void> {
    const { screenId, bounds: targetBounds } = ctx.target;

    const targetDisplay = this.getDisplay(screenId);
    if (targetDisplay === undefined || targetBounds === undefined) {
      return;
    }

    const { x, y, width, height } = this.adjustBoundsOnDisplay(
      targetDisplay,
      targetBounds
    );

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

    this.lastFfmpeg = ffmpeg;
  }

  async finish(_ctx: ICaptureContext): Promise<void> {
    assert(this.lastFfmpeg !== undefined);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proc = (this.lastFfmpeg as any).ffmpegProc as ChildProcess;
    proc?.stdin?.write('q');
  }

  private getDisplay(screenId: number): Display | undefined {
    return screen.getAllDisplays().find((d) => d.id === screenId);
  }

  private adjustBoundsOnDisplay(targetDisp: Display, bounds: IBounds): IBounds {
    const scaledBounds = this.calcScaledScreenBounds(targetDisp);
    return {
      x: scaledBounds.x + bounds.x * targetDisp.scaleFactor,
      y: scaledBounds.y + bounds.y * targetDisp.scaleFactor,
      width: bounds.width * targetDisp.scaleFactor,
      height: bounds.height * targetDisp.scaleFactor,
    };
  }

  private calcScaledScreenBounds(targetDisp: Display): IBounds {
    const primaryDisp = screen.getPrimaryDisplay();
    if (targetDisp === primaryDisp) {
      return {
        x: targetDisp.bounds.x * targetDisp.scaleFactor,
        y: targetDisp.bounds.y * targetDisp.scaleFactor,
        width: targetDisp.bounds.width * targetDisp.scaleFactor,
        height: targetDisp.bounds.height * targetDisp.scaleFactor,
      };
    }

    const scaled = (p: number, s: number) => {
      if (p >= 0) {
        return p * primaryDisp.scaleFactor;
      }

      const unscaledJoint = s + p;
      return (
        unscaledJoint * primaryDisp.scaleFactor - s * targetDisp.scaleFactor
      );
    };

    const { x, y, width, height } = targetDisp.bounds;
    return {
      x: scaled(x, width),
      y: scaled(y, height),
      width: width * targetDisp.scaleFactor,
      height: height * targetDisp.scaleFactor,
    };
  }
}
