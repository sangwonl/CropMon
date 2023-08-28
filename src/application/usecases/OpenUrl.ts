import { inject, injectable } from 'inversify';

import { TYPES } from '@di/types';

import type { UiDirector } from '@application/ports/director';
import type { UseCase } from '@application/usecases/UseCase';

interface OpenUrlUseCaseInput {
  url: string;
}

@injectable()
export class OpenUrlUseCase implements UseCase<OpenUrlUseCaseInput> {
  constructor(@inject(TYPES.UiDirector) private uiDirector: UiDirector) {}

  execute(input: OpenUrlUseCaseInput): void {
    this.uiDirector.openExternal(input.url);
  }
}
