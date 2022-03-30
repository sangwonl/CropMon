import { ipcRenderer, IpcRendererEvent } from 'electron';
import { useState, useRef, useEffect, SetStateAction, Dispatch } from 'react';

import { INITIAL_UI_STATE, IUiState } from '@core/entities/ui';

export const useStateWithGetter = <S>(
  initialState: S
): [S, () => S, Dispatch<SetStateAction<S>>] => {
  const [state, setState] = useState<S>(initialState);
  const stateRef = useRef<S>(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  return [state, () => stateRef.current, setState];
};

export const useRootUiState = (): IUiState => {
  const [uiState, setUiState] = useState<IUiState>(INITIAL_UI_STATE);

  useEffect(() => {
    const handleSyncStates = (_event: IpcRendererEvent, newState: IUiState) => {
      setUiState(newState);
    };
    ipcRenderer.on('syncStates', handleSyncStates);
    ipcRenderer.send('joinForSynStates');
    return () => {
      ipcRenderer.removeListener('syncStates', handleSyncStates);
    };
  }, []);

  return uiState;
};
