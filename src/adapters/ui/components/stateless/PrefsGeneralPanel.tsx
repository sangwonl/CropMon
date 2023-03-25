/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/tabindex-no-positive */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */

import classNames from 'classnames';
import React, {
  useState,
  useCallback,
  useEffect,
  ChangeEvent,
  KeyboardEvent,
} from 'react';

import {
  extractShortcut,
  validateShortcut,
  shortcutForDisplay,
} from '@utils/shortcut';

import { Preferences } from '@domain/models/preferences';

import styles from './PrefsTabPanels.css';

type Props = {
  prefs: Preferences;
  onSave: (prefs: Preferences) => void;
  onCancel: () => void;
  selectedRecordHome: string;
  onChooseRecordHome: () => void;
};

type OptionType = string | number | boolean;
const isChanged = (a: OptionType, b: OptionType) => a !== b;

function PrefsGeneralPanel({
  prefs,
  selectedRecordHome,
  onChooseRecordHome,
  onSave,
  onCancel,
}: Props) {
  // General options
  const [runAtStartup, setRunAtStartup] = useState<boolean>(prefs.runAtStartup);
  const [showCountdown, setShowCountdown] = useState<boolean>(
    prefs.showCountdown
  );

  // Output options
  const [recordHome, setRecordHome] = useState<string>(selectedRecordHome);
  const [openRecordHome, setOpenRecordHome] = useState<boolean>(
    prefs.openRecordHomeWhenRecordCompleted
  );

  // Shortcut options
  const [shortcut, setShortcut] = useState<string>(prefs.shortcut);
  const [shortcutFocused, setShortcutFocused] = useState<boolean>(false);
  const [shortcutValidated, setShortcutValidated] = useState<boolean>(true);
  const setShortcutKey = useCallback((s: string) => {
    setShortcutValidated(validateShortcut(s));
    setShortcut(s);
  }, []);
  const resetShortcut = useCallback(() => {
    setShortcutValidated(validateShortcut(prefs.shortcut));
    setShortcut(prefs.shortcut);
  }, [prefs.shortcut]);
  const handleShortcutKeyEvent = useCallback(
    (event: KeyboardEvent) => {
      const extracted = extractShortcut(event);
      if (extracted === 'Escape') {
        resetShortcut();
      } else {
        setShortcutKey(extracted);
      }
    },
    [setShortcutKey, resetShortcut]
  );

  // Dirty and saveability check
  const canSave = useCallback(() => {
    const { openRecordHomeWhenRecordCompleted } = prefs;
    return (
      shortcutValidated &&
      (isChanged(prefs.runAtStartup, runAtStartup) ||
        isChanged(prefs.showCountdown, showCountdown) ||
        isChanged(prefs.recordHome, recordHome) ||
        isChanged(openRecordHomeWhenRecordCompleted, openRecordHome) ||
        isChanged(prefs.shortcut, shortcut))
    );
  }, [
    prefs,
    runAtStartup,
    showCountdown,
    recordHome,
    openRecordHome,
    shortcut,
    shortcutValidated,
  ]);

  // Save handler
  const handleSave = useCallback(() => {
    const newPrefs: Preferences = {
      ...prefs,
      runAtStartup,
      showCountdown,
      recordHome,
      openRecordHomeWhenRecordCompleted: openRecordHome,
      shortcut,
    };
    onSave(newPrefs);
  }, [
    prefs,
    onSave,
    runAtStartup,
    showCountdown,
    recordHome,
    openRecordHome,
    shortcut,
  ]);

  // Update states
  useEffect(() => {
    setRunAtStartup(prefs.runAtStartup);
    setShowCountdown(prefs.showCountdown);
    setRecordHome(selectedRecordHome);
    setOpenRecordHome(prefs.openRecordHomeWhenRecordCompleted);
    setShortcutKey(prefs.shortcut);
  }, [prefs, selectedRecordHome, setShortcutKey]);

  return (
    <div className={styles.container}>
      <div className={styles.panelOptions}>
        <fieldset>
          <legend>General options</legend>
          <div className={styles.optionRow}>
            <input
              id="opt-run-at-startup"
              type="checkbox"
              checked={runAtStartup}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setRunAtStartup(e.target.checked)
              }
            />
            <label htmlFor="opt-run-at-startup">
              Run automatically at startup
            </label>
          </div>
          <div className={styles.optionRow}>
            <input
              id="opt-show-countdown"
              type="checkbox"
              checked={showCountdown}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setShowCountdown(e.target.checked)
              }
            />
            <label htmlFor="opt-show-countdown">
              Show countdown before recording start
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend>Shortcut to start or stop recording</legend>
          <div className={styles.optionRow}>
            <div
              className={classNames(styles.shortcut, {
                [styles.shortcutFocusedValid]:
                  shortcutFocused && shortcutValidated,
                [styles.shortcutInvalid]: !shortcutValidated,
              })}
            >
              <input
                id={styles.shortcutInput}
                type="text"
                value={shortcutForDisplay(shortcut)}
                onKeyDown={handleShortcutKeyEvent}
                onFocus={() => setShortcutFocused(true)}
                onBlur={() => setShortcutFocused(false)}
                readOnly
              />
              <span
                className={classNames({
                  [styles.shortcutCancelIcon]: shortcut !== prefs.shortcut,
                  [styles.shortcutCancelIconHidden]:
                    shortcut === prefs.shortcut,
                })}
              >
                Press <b>ESC</b> to reset
              </span>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>Output file will be saved to</legend>
          <div className={styles.optionRow}>
            <input type="text" value={recordHome} readOnly />
            <button type="button" onClick={onChooseRecordHome}>
              ...
            </button>
          </div>
          <div className={styles.optionRow}>
            <input
              id="opt-open-rec-home"
              type="checkbox"
              checked={openRecordHome}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setOpenRecordHome(e.target.checked)
              }
            />
            <label htmlFor="opt-open-rec-home">
              Open the folder when recording complete
            </label>
          </div>
        </fieldset>
      </div>
      <div className={styles.panelButtons}>
        <button type="button" disabled={!canSave()} onClick={handleSave}>
          Save
        </button>
        <button tabIndex={1} type="button" onClick={onCancel}>
          Close
        </button>
      </div>
    </div>
  );
}

export default PrefsGeneralPanel;
