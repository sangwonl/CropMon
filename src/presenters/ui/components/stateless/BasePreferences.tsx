/* eslint-disable react/destructuring-assignment */
/* eslint-disable import/prefer-default-export */

import React from 'react';

import {
  Grid,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
} from '@material-ui/core';

import { IPreferences } from '@core/entities/preferences';

import styles from './BasePreferences.css';

export interface BasePreferencesProps {
  prefs: IPreferences;
  onChooseRecordHomeDir: () => void;
  onToggleOpenRecordHomeDir: () => void;
  onClose: (shouldSave?: boolean) => void;
}

export const BasePreferences = (props: BasePreferencesProps) => {
  const { prefs } = props;

  return (
    <Grid container className={styles.mainContainer}>
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
      <Grid container className={styles.itemOpenRecordHome}>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              name="open-record-home-when-completed"
              checked={prefs.openRecordHomeDirWhenRecordCompleted}
              onChange={props.onToggleOpenRecordHomeDir}
            />
          }
          label="Open the folder when recording complete"
        />
      </Grid>
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
    </Grid>
  );
};
