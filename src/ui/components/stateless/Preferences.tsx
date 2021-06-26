/* eslint-disable react/destructuring-assignment */
/* eslint-disable import/prefer-default-export */

import React, { useState, KeyboardEvent, useEffect } from 'react';

import {
  Paper,
  Grid,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
} from '@material-ui/core';

import { IPreferences } from '@core/entities/preferences';
import { textifyShortcut } from '@utils/shortcut';

import styles from './Preferences.css';

export interface PreferencesProps {
  preferences: IPreferences;
  onClose: (shouldSave: boolean) => void;
  onChooseRecordHome: () => void;
  onToggleOpenRecordHome: (shouldOpen: boolean) => void;
  onShortcutChanged: (shortcut: string) => void;
}

export const Preferences = (props: PreferencesProps) => {
  const { preferences } = props;

  const [openRecordHomeDir, setOpenRecordHomeDir] = useState<boolean>(
    preferences.openRecordHomeWhenRecordCompleted
  );

  const [shortcutKey, setShortcutKey] = useState<string>(preferences.shortcut);

  const onShortcutHandler = (e: KeyboardEvent<HTMLDivElement>) => {
    const shortcut = textifyShortcut(e);
    setShortcutKey(shortcut);
    props.onShortcutChanged(shortcut);
  };

  useEffect(() => {
    setOpenRecordHomeDir(preferences.openRecordHomeWhenRecordCompleted);
    setShortcutKey(preferences.shortcut);
  }, [preferences.openRecordHomeWhenRecordCompleted, preferences.shortcut]);

  return (
    <>
      <Paper className={styles.itemContainer}>
        <p>General</p>
        <Grid container className={styles.itemRow}>
          <TextField
            className={styles.itemRecordHome}
            label="Record files to:"
            variant="outlined"
            value={preferences.recordHome}
            InputProps={{ readOnly: true }}
          />
          <Button variant="outlined" onClick={props.onChooseRecordHome}>
            ...
          </Button>
        </Grid>
        <Grid container>
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                name="open-record-home-when-completed"
                checked={openRecordHomeDir}
                onChange={(event) => {
                  const { checked } = event.target;
                  setOpenRecordHomeDir(checked);
                  props.onToggleOpenRecordHome(checked);
                }}
              />
            }
            label="Open the folder when recording complete"
          />
        </Grid>
      </Paper>
      <Paper className={styles.itemContainer}>
        <p>Shortcut</p>
        <Grid container className={styles.itemRow}>
          <TextField
            className={styles.itemRecordHome}
            label="Shortcut to start or stop recording:"
            variant="outlined"
            value={shortcutKey}
            onKeyDown={onShortcutHandler}
            InputProps={{ readOnly: true }}
          />
        </Grid>
      </Paper>
      <Grid container className={styles.buttonRow}>
        <Button
          className={styles.button}
          color="secondary"
          variant="contained"
          onClick={() => props.onClose(true)}
        >
          Save
        </Button>
        <Button
          className={styles.button}
          color="default"
          variant="contained"
          onClick={() => props.onClose(false)}
        >
          Close
        </Button>
      </Grid>
    </>
  );
};
