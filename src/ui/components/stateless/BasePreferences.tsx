/* eslint-disable react/destructuring-assignment */
/* eslint-disable import/prefer-default-export */

import React, { useState, KeyboardEvent } from 'react';

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

import styles from './BasePreferences.css';

export interface BasePreferencesProps {
  prefs: IPreferences;
  onChooseRecordHomeDir: () => void;
  onToggleOpenRecordHomeDir: (shouldOpen: boolean) => void;
  onChangeShortcut: (shortcut: string) => void;
  onClose: (shouldSave?: boolean) => void;
}

export const BasePreferences = (props: BasePreferencesProps) => {
  const { prefs } = props;

  const [openRecordHomeDir, setOpenRecordHomeDir] = useState<boolean>(
    prefs.openRecordHomeDirWhenRecordCompleted
  );

  const [shortcutKey, setShortcutKey] = useState<string>(prefs.shortcut);

  const onShortcutHandler = (e: KeyboardEvent<HTMLDivElement>) => {
    const shortcut = textifyShortcut(e);
    setShortcutKey(shortcut);
    props.onChangeShortcut(shortcut);
  };

  return (
    <>
      <Paper className={styles.itemContainer}>
        <p>General</p>
        <Grid container className={styles.itemRow}>
          <TextField
            className={styles.itemRecordHome}
            label="Record files to:"
            variant="outlined"
            value={prefs.recordHomeDir}
            InputProps={{ readOnly: true }}
          />
          <Button variant="outlined" onClick={props.onChooseRecordHomeDir}>
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
                  props.onToggleOpenRecordHomeDir(checked);
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
          onClick={() => props.onClose()}
        >
          Close
        </Button>
      </Grid>
    </>
  );
};
