import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import type { Preferences } from '@domain/models/preferences';
import type { PreferencesRepository } from '@domain/repositories/preferences';

import type { UseCase } from '@application/usecases/UseCase';

interface SavePrefsUseCaseInput {
  prefs: Preferences;
}

interface SavePrefsUseCaseOutput {
  prefs: Preferences;
}

@injectable()
export default class SavePrefsUseCase
  implements UseCase<SavePrefsUseCaseInput>
{
  constructor(
    @inject(TYPES.PreferencesRepository)
    private prefsRepo: PreferencesRepository,
  ) {}

  async execute(input: SavePrefsUseCaseInput): Promise<SavePrefsUseCaseOutput> {
    const { prefs } = input;
    await this.prefsRepo.updatePreference(prefs);
    return { prefs };
  }
}
