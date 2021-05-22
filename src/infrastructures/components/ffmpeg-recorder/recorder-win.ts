/* eslint-disable radix */
/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */

import assert from 'assert';
import { ChildProcess, exec } from 'child_process';

import log from 'electron-log';
import { Display, screen } from 'electron';
import { injectable } from 'inversify';
import Ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';

import { ICaptureContext } from '@core/entities/capture';
import { IBounds } from '@core/entities/screen';
import { IScreenRecorder } from '@core/components/recorder';
import { getPathToFfmpeg, inferVideoCodec } from '@utils/ffmpeg';

@injectable()
export class FfmpegScreenRecorderWin implements IScreenRecorder {
  lastFfmpeg!: FfmpegCommand;

  // eslint-disable-next-line class-methods-use-this
  async record(ctx: ICaptureContext): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const outPath = ctx.outputPath!;
    const { screenId, bounds: targetBounds } = ctx.target;

    const targetDisplay = this.getDisplay(screenId);
    if (targetDisplay === undefined || targetBounds === undefined) {
      return Promise.reject();
    }

    const wholeScreenBounds = await this.getWholeScreenBounds();

    const { x, y, width, height } = this.adjustBoundsOnDisplay(
      targetDisplay,
      targetBounds,
      wholeScreenBounds
    );

    return new Promise((resolve, reject) => {
      const ffmpeg = Ffmpeg()
        .setFfmpegPath(getPathToFfmpeg())
        .input('desktop')
        .inputFormat('gdigrab')
        .inputOptions([
          '-framerate 60',
          '-draw_mouse 1',
          `-offset_x ${x}`,
          `-offset_y ${y}`,
          `-video_size ${width}x${height}`,
        ])
        .videoCodec(inferVideoCodec(outPath))
        .withVideoFilter('pad=ceil(iw/2)*2:ceil(ih/2)*2')
        .withOptions(['-pix_fmt yuv420p', '-r 60'])
        .on('start', (cmd) => {
          log.info(cmd);
          this.lastFfmpeg = ffmpeg;
          resolve();
        })
        .on('error', (_err, _stdout, stderr) => {
          log.error(stderr);
          reject();
        });

      ffmpeg.save(outPath);
    });
  }

  async finish(_ctx: ICaptureContext): Promise<void> {
    assert(this.lastFfmpeg !== undefined);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proc = (this.lastFfmpeg as any).ffmpegProc as ChildProcess;
    proc?.stdin?.write('q');

    return Promise.resolve();
  }

  private getDisplay(screenId: number): Display | undefined {
    return screen.getAllDisplays().find((d) => d.id === screenId);
  }

  private getWholeScreenBounds(): Promise<IBounds> {
    return new Promise((resolve, reject) => {
      const cmd = `"${getPathToFfmpeg()}" -f gdigrab -i desktop`;
      exec(cmd, (_error, _stdout, stderr) => {
        const matched = stderr.match(
          /whole desktop as (-?\d+)x(-?\d+).*at \((-?\d+),(-?\d+)\)/
        );
        if (matched === null) {
          reject();
          return;
        }

        // eslint-disable-next-line @typescript-eslint/naming-convention
        const [_, fw, fh, sx, sy] = matched;
        const x = parseInt(sx);
        const y = parseInt(sy);
        resolve({
          x,
          y,
          width: parseInt(fw) + x,
          height: parseInt(fh) + y,
        });
      });
    });
  }

  private adjustBoundsOnDisplay(
    targetDisp: Display,
    bounds: IBounds,
    wholeScreenBounds: IBounds
  ): IBounds {
    const scaledBounds = this.calcScaledScreenBounds(targetDisp);
    const x = Math.floor(scaledBounds.x + bounds.x * targetDisp.scaleFactor);
    const y = Math.floor(scaledBounds.y + bounds.y * targetDisp.scaleFactor);
    const width = Math.floor(bounds.width * targetDisp.scaleFactor);
    const height = Math.floor(bounds.height * targetDisp.scaleFactor);
    return {
      x: Math.max(x, wholeScreenBounds.x),
      y: Math.max(y, wholeScreenBounds.y),
      width: Math.min(width, wholeScreenBounds.width),
      height: Math.min(height, wholeScreenBounds.height),
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
