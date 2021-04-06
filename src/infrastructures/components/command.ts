/* eslint-disable import/prefer-default-export */

import { injectable } from 'inversify';
import { CommandDispatcher } from '../../core/components';

@injectable()
export class CommandDispatcherImpl implements CommandDispatcher {}
