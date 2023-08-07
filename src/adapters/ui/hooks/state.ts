import { ipcRenderer, type IpcRendererEvent } from 'electron';
import {
  useState,
  useRef,
  useEffect,
  type SetStateAction,
  type Dispatch,
} from 'react';

import type { UiState } from '@application/models/ui';

import { useUseCaseInteractor } from '@adapters/ui/hooks/interactor';

export const useStateWithGetter = <S>(
  initialState: S,
): [S, () => S, Dispatch<SetStateAction<S>>] => {
  const [state, setState] = useState<S>(initialState);
  const stateRef = useRef<S>(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  return [state, () => stateRef.current, setState];
};

export const useRootUiState = (): UiState => {
  const interactor = useUseCaseInteractor();
  const [uiState, setUiState] = useState<UiState>(interactor.getUiState());

  useEffect(() => {
    const handleSyncStates = (_event: IpcRendererEvent, newState: UiState) => {
      setUiState(newState);
    };
    ipcRenderer.on('syncStates', handleSyncStates);
    return () => {
      ipcRenderer.removeListener('syncStates', handleSyncStates);
    };
  }, []);

  return uiState;
};
