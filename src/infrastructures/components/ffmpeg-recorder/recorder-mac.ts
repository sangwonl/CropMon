/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */

import assert from 'assert';
import { ChildProcess } from 'child_process';

import log from 'electron-log';
import { Display, screen } from 'electron';
import { injectable } from 'inversify';
import Ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';

import { ICaptureContext } from '@core/entities/capture';
import { IBounds } from '@core/entities/screen';
import { IScreenRecorder } from '@core/components/recorder';
import { getPathToFfmpeg, inferVideoCodec } from '@utils/ffmpeg';

@injectable()
export class FfmpegScreenRecorderMac implements IScreenRecorder {
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

    const screenIdx = this.getScreenIdx(targetDisplay);
    const { x, y, width, height } = this.calcScaledBounds(
      targetBounds,
      targetDisplay
    );

    return new Promise((resolve, reject) => {
      const ffmpeg = Ffmpeg()
        .setFfmpegPath(getPathToFfmpeg())
        .input(`${screenIdx}:none`)
        .inputFormat('avfoundation')
        .inputOptions(['-framerate 60', '-capture_cursor 1'])
        .videoCodec(inferVideoCodec(outPath))
        .withVideoFilter(`crop=${width}:${height}:${x}:${y}`)
        .withOptions(['-pix_fmt yuv420p', '-r 60'])
        .on('start', (cmd) => {
          log.info(cmd);
          this.lastFfmpeg = ffmpeg;
          resolve();
        })
        .on('error', (_error, _stdout, stderr) => {
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
  }

  private getDisplay(screenId: number): Display | undefined {
    return screen.getAllDisplays().find((d) => d.id === screenId);
  }

  private getScreenIdx(targetDisp: Display): number {
    return screen.getAllDisplays().findIndex((d) => d.id === targetDisp.id) + 1;
  }

  private calcScaledBounds(bounds: IBounds, disp: Display): IBounds {
    return {
      x: bounds.x * disp.scaleFactor,
      y: bounds.y * disp.scaleFactor,
      width: bounds.width * disp.scaleFactor,
      height: bounds.height * disp.scaleFactor,
    };
  }
}