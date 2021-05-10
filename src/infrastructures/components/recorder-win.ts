/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */

import assert from 'assert';

import { Display, screen } from 'electron';
import { ChildProcess } from 'child_process';
import Ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import { injectable } from 'inversify';

import { CaptureContext } from '@core/entities/capture';
import { ScreenBounds } from '@core/entities/screen';
import { ScreenRecorder } from '@core/components';

@injectable()
export class ScreenRecorderWindows implements ScreenRecorder {
  lastFfmpeg!: FfmpegCommand;

  // eslint-disable-next-line class-methods-use-this
  async record(ctx: CaptureContext): Promise<void> {
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

  async finish(_ctx: CaptureContext): Promise<void> {
    assert(this.lastFfmpeg !== undefined);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proc = (this.lastFfmpeg as any).ffmpegProc as ChildProcess;
    proc?.stdin?.write('q');
  }

  private getDisplay(screenId: number): Display | undefined {
    return screen.getAllDisplays().find((d) => d.id === screenId);
  }

  private adjustBoundsOnDisplay(
    targetDisp: Display,
    bounds: ScreenBounds
  ): ScreenBounds {
    const scaledBounds = this.calcScaledScreenBounds(targetDisp);
    return new ScreenBounds(
      scaledBounds.x + bounds.x * targetDisp.scaleFactor,
      scaledBounds.y + bounds.y * targetDisp.scaleFactor,
      bounds.width * targetDisp.scaleFactor,
      bounds.height * targetDisp.scaleFactor
    );
  }

  private calcScaledScreenBounds(targetDisp: Display): ScreenBounds {
    const primaryDisp = screen.getPrimaryDisplay();
    const unScaledTargetDispBounds = new ScreenBounds(
      targetDisp.bounds.x,
      targetDisp.bounds.y,
      targetDisp.bounds.width,
      targetDisp.bounds.height
    );

    if (targetDisp === primaryDisp) {
      return unScaledTargetDispBounds.scaleBy(targetDisp.scaleFactor);
    }

    const { x, y, width, height } = unScaledTargetDispBounds;
    let scaledBoundsX = x;
    let scaledBoundsY = y;

    if (x >= 0) {
      scaledBoundsX = x * primaryDisp.scaleFactor;
    } else {
      const unscaledJoint = width + x;
      scaledBoundsX =
        unscaledJoint * primaryDisp.scaleFactor -
        width * targetDisp.scaleFactor;
    }

    if (y >= 0) {
      scaledBoundsY = y * primaryDisp.scaleFactor;
    } else {
      const unscaledJoint = height + y;
      scaledBoundsY =
        unscaledJoint * primaryDisp.scaleFactor -
        height * targetDisp.scaleFactor;
    }

    return new ScreenBounds(
      scaledBoundsX,
      scaledBoundsY,
      width * targetDisp.scaleFactor,
      height * targetDisp.scaleFactor
    );
  }
}
