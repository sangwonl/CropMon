import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { RecordOptions } from '@domain/models/capture';

import { UseCase } from '@application/usecases/UseCase';

import PreferencesRepository from '@adapters/repositories/preferences';

interface ToggleRecordOptionsUseCaseInput {
  recordOptions: RecordOptions;
}

@injectable()
export default class ToggleRecordOptionsUseCase
  implements UseCase<ToggleRecordOptionsUseCaseInput>
{
  constructor(
    // eslint-disable-next-line prettier/prettier
    @inject(TYPES.PreferencesRepository) private prefsRepo: PreferencesRepository
  ) {}

  async execute(input: ToggleRecordOptionsUseCaseInput) {
    const prefs = await this.prefsRepo.fetchUserPreferences();

    this.prefsRepo.applyRecOptionsToPrefs(prefs, input.recordOptions);

    await this.prefsRepo.updateUserPreference(prefs);
  }
}
