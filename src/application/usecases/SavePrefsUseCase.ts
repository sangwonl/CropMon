import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { Preferences } from '@domain/models/preferences';
import { PreferencesRepository } from '@domain/repositories/preferences';

import { UseCase } from '@application/usecases/UseCase';

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
    // eslint-disable-next-line prettier/prettier
    @inject(TYPES.PreferencesRepository) private prefsRepo: PreferencesRepository
  ) {}

  async execute(input: SavePrefsUseCaseInput): Promise<SavePrefsUseCaseOutput> {
    const { prefs } = input;
    await this.prefsRepo.updatePreference(prefs);
    return { prefs };
  }
}
