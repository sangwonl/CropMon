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
import Clear from '@material-ui/icons/Clear';

import { IPreferences } from '@core/entities/preferences';
import {
  extractShortcut,
  validateShortcut,
  shortcutForDisplay,
} from '@utils/shortcut';

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
  const [runAtStartup, setRunAtStartup] = useState<boolean>(
    origPrefs.runAtStartup
  );
  const [showCountdown, setShowCountdown] = useState<boolean>(
    origPrefs.showCountdown
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
    setRunAtStartup(origPrefs.runAtStartup);
    setShowCountdown(origPrefs.showCountdown);
  }, [origPrefs]);

  return (
    <>
      <div className={styles.itemContainer}>
        <p className={styles.itemTitle}>General</p>
        <Grid container>
          <FormControlLabel
            control={
              <Checkbox
                tabIndex={-1}
                color="primary"
                name="run-at-startup"
                checked={runAtStartup}
                onChange={({ target }) => {
                  setRunAtStartup(target.checked);
                }}
              />
            }
            label="Run automatically at startup"
          />
        </Grid>
        <Grid container>
          <FormControlLabel
            control={
              <Checkbox
                tabIndex={-1}
                color="primary"
                name="show-countdown"
                checked={showCountdown}
                onChange={({ target }) => {
                  setShowCountdown(target.checked);
                }}
              />
            }
            label="Show countdown before recording start"
          />
        </Grid>
      </div>
      <div className={styles.itemContainer}>
        <p className={styles.itemTitle}>Output</p>
        <Grid container className={styles.itemRow}>
          <TextField
            className={styles.itemRecordHome}
            label="Record files to:"
            variant="outlined"
            value={recordHome}
            inputProps={{ readOnly: true, tabIndex: -1 }}
          />
          <Button
            tabIndex={-1}
            variant="outlined"
            onClick={props.onChooseRecordHome}
          >
            ...
          </Button>
        </Grid>
        <Grid container>
          <FormControlLabel
            control={
              <Checkbox
                tabIndex={-1}
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
            <InputLabel htmlFor="shortcut">
              Shortcut to start or stop recording:
            </InputLabel>
            <OutlinedInput
              id="shortcut"
              type="text"
              readOnly
              value={shortcutForDisplay(shortcut)}
              error={!shortcutValidated}
              onKeyDown={(e: any) => {
                if (e.key === 'Escape') {
                  resetShortcut();
                } else {
                  setShortcutKey(extractShortcut(e));
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
              inputProps={{ tabIndex: -1 }}
            />
          </FormControl>
        </Grid>
      </div>
      <div className={styles.itemContainer}>
        <Grid container className={styles.buttonRow}>
          <Button
            tabIndex={-1}
            className={styles.button}
            color="secondary"
            variant="contained"
            disabled={!shortcutValidated}
            onClick={() => {
              const newPrefs: IPreferences = {
                ...origPrefs,
                openRecordHomeWhenRecordCompleted: openRecordHome,
                recordHome,
                shortcut,
                runAtStartup,
                showCountdown,
              };
              props.onClose(newPrefs);
            }}
          >
            Save
          </Button>
          <Button
            tabIndex={-1}
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
