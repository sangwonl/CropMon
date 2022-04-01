import { injectable } from 'inversify';

import { RecordOptions } from '@domain/models/capture';

import { UseCase } from '@application/usecases/UseCase';
import PreferencesRepository from '@application/repositories/preferences';

interface ToggleRecordOptionsUseCaseInput {
  recordOptions: RecordOptions;
}

@injectable()
export default class ToggleRecordOptionsUseCase
  implements UseCase<ToggleRecordOptionsUseCaseInput>
{
  constructor(private prefsRepo: PreferencesRepository) {}

  async execute(input: ToggleRecordOptionsUseCaseInput) {
    const prefs = await this.prefsRepo.fetchUserPreferences();

    this.prefsRepo.applyRecOptionsToPrefs(prefs, input.recordOptions);

    await this.prefsRepo.updateUserPreference(prefs);
  }
}
