/* eslint-disable no-alert */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable import/prefer-default-export */

import React, { useEffect, useState } from 'react';

import {
  Grid,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
} from '@material-ui/core';
import { Clear } from '@material-ui/icons';

import { IPreferences } from '@core/entities/preferences';
import { textifyShortcut, validateShortcut } from '@utils/shortcut';

import styles from './Preferences.css';

export interface PreferencesProps {
  preferences: IPreferences;
  onClose: (preferences: IPreferences | undefined) => void;
  onChooseRecordHome: () => void;
}

export const Preferences = (props: PreferencesProps) => {
  const { preferences: origPrefs } = props;

  const [shortcut, setShortcut] = useState<string>(origPrefs.shortcut);
  const [shortcutValidated, setShortcutValidated] = useState<boolean>(true);
  const [recordHome, setRecordHome] = useState<string>(origPrefs.recordHome);
  const [openRecordHome, setOpenRecordHome] = useState<boolean>(
    origPrefs.openRecordHomeWhenRecordCompleted
  );

  const setShortcutKey = (s: string) => {
    setShortcutValidated(validateShortcut(s));
    setShortcut(s);
  };

  const resetShortcut = () => {
    setShortcutValidated(validateShortcut(origPrefs.shortcut));
    setShortcut(origPrefs.shortcut);
  };

  useEffect(() => {
    setShortcutKey(origPrefs.shortcut);
    setRecordHome(origPrefs.recordHome);
    setOpenRecordHome(origPrefs.openRecordHomeWhenRecordCompleted);
  }, [origPrefs]);

  return (
    <>
      <div className={styles.itemContainer}>
        <p className={styles.itemTitle}>General</p>
        <Grid container className={styles.itemRow}>
          <TextField
            className={styles.itemRecordHome}
            label="Record files to:"
            variant="outlined"
            value={recordHome}
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
                checked={openRecordHome}
                onChange={({ target }) => {
                  setOpenRecordHome(target.checked);
                }}
              />
            }
            label="Open the folder when recording complete"
          />
        </Grid>
      </div>
      <div className={styles.itemContainer}>
        <p className={styles.itemTitle}>Shortcut</p>
        <Grid container className={styles.itemRow}>
          <FormControl className={styles.itemShortcut} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">
              Shortcut to start or stop recording:
            </InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              type="text"
              readOnly
              value={shortcut}
              error={!shortcutValidated}
              onKeyDown={(e: any) => {
                if (e.key === 'Escape') {
                  resetShortcut();
                } else {
                  setShortcutKey(textifyShortcut(e));
                }
              }}
              endAdornment={
                origPrefs.shortcut !== shortcut && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="reset shortcut overriden"
                      onClick={() => {
                        resetShortcut();
                      }}
                      edge="end"
                    >
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                )
              }
              labelWidth={252}
            />
          </FormControl>
        </Grid>
      </div>
      <div className={styles.itemContainer}>
        <Grid container className={styles.buttonRow}>
          <Button
            className={styles.button}
            color="secondary"
            variant="contained"
            disabled={!shortcutValidated}
            onClick={() => {
              const newPrefs: IPreferences = {
                version: origPrefs.version,
                recordHome,
                openRecordHomeWhenRecordCompleted: openRecordHome,
                shortcut,
              };
              props.onClose(newPrefs);
            }}
          >
            Save
          </Button>
          <Button
            className={styles.button}
            color="default"
            variant="contained"
            onClick={() => props.onClose(undefined)}
          >
            Close
          </Button>
        </Grid>
      </div>
    </>
  );
};
