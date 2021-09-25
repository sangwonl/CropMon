/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable import/prefer-default-export */
/* eslint-disable jsx-a11y/label-has-associated-control */

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
} from 'react';
import classNames from 'classnames';

import { IPreferences } from '@core/entities/preferences';
import {
  extractShortcut,
  validateShortcut,
  shortcutForDisplay,
} from '@utils/shortcut';

import styles from './PrefsTabPanels.css';

interface PrefsTabPanelBaseProps {
  initialPrefs: IPreferences;
  onSave: (prefs: IPreferences) => void;
  onCancel: () => void;
}

interface PrefsGeneralTabPanelProps extends PrefsTabPanelBaseProps {
  selectedRecordHome: string;
  onChooseRecordHome: () => void;
}

// type PrefsRecordingTabPanelProps = PrefsTabPanelBaseProps;

type OptionType = string | number | boolean;
const isChanged = (a: OptionType, b: OptionType) => a !== b;

export const PrefsGeneralTabPanel = ({
  initialPrefs,
  selectedRecordHome,
  onChooseRecordHome,
  onSave,
  onCancel,
}: PrefsGeneralTabPanelProps) => {
  // General options
  const [runAtStartup, setRunAtStartup] = useState<boolean>(
    initialPrefs.runAtStartup
  );
  const [showCountdown, setShowCountdown] = useState<boolean>(
    initialPrefs.showCountdown
  );

  // Output options
  const [recordHome, setRecordHome] = useState<string>(selectedRecordHome);
  const [openRecordHome, setOpenRecordHome] = useState<boolean>(
    initialPrefs.openRecordHomeWhenRecordCompleted
  );

  // Shortcut options
  const shortcutInputRef = useRef<HTMLInputElement>(null);
  const [shortcut, setShortcut] = useState<string>(initialPrefs.shortcut);
  const [shortcutValidated, setShortcutValidated] = useState<boolean>(true);
  const setShortcutKey = useCallback((s: string) => {
    setShortcutValidated(validateShortcut(s));
    setShortcut(s);
  }, []);
  const resetShortcut = useCallback(() => {
    setShortcutValidated(validateShortcut(initialPrefs.shortcut));
    setShortcut(initialPrefs.shortcut);
  }, [initialPrefs.shortcut]);
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

  // Dirty check
  const isDirty = useCallback(() => {
    const { openRecordHomeWhenRecordCompleted } = initialPrefs;
    return (
      isChanged(initialPrefs.runAtStartup, runAtStartup) ||
      isChanged(initialPrefs.showCountdown, showCountdown) ||
      isChanged(initialPrefs.recordHome, recordHome) ||
      isChanged(openRecordHomeWhenRecordCompleted, openRecordHome) ||
      isChanged(initialPrefs.shortcut, shortcut)
    );
  }, [
    initialPrefs,
    runAtStartup,
    showCountdown,
    recordHome,
    openRecordHome,
    shortcut,
  ]);

  // Save handler
  const handleSave = useCallback(() => {
    const newPrefs: IPreferences = {
      ...initialPrefs,
      runAtStartup,
      showCountdown,
      recordHome,
      openRecordHomeWhenRecordCompleted: openRecordHome,
      shortcut,
    };
    onSave(newPrefs);
  }, [
    initialPrefs,
    onSave,
    runAtStartup,
    showCountdown,
    recordHome,
    openRecordHome,
    shortcut,
  ]);

  // Update states
  useEffect(() => {
    setRunAtStartup(initialPrefs.runAtStartup);
    setShowCountdown(initialPrefs.showCountdown);
    setRecordHome(selectedRecordHome);
    setOpenRecordHome(initialPrefs.openRecordHomeWhenRecordCompleted);
    setShortcutKey(initialPrefs.shortcut);
  }, [initialPrefs, selectedRecordHome, setShortcutKey]);

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
          <legend>Shortcut to start or stop capturing</legend>
          <div className={styles.optionRow}>
            <input
              ref={shortcutInputRef}
              type="text"
              className={classNames({
                [styles.shortcutInput]: shortcutValidated,
                [styles.shortcutInvalid]: !shortcutValidated,
              })}
              value={shortcutForDisplay(shortcut)}
              onKeyDown={handleShortcutKeyEvent}
              readOnly
            />
            <span
              className={classNames({
                [styles.shortcutCancelIcon]: shortcut !== initialPrefs.shortcut,
                [styles.shortcutCancelIconHidden]:
                  shortcut === initialPrefs.shortcut,
              })}
            >
              Press <b>ESC</b> to reset
            </span>
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
        <div className={styles.panelButtons}>
          <button type="button" disabled={!isDirty()} onClick={handleSave}>
            Save
          </button>
          <button type="button" onClick={onCancel}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// export const PrefsRecordingTabPanel = ({
//   initialPrefs,
//   onSave,
//   onCancel,
// }: PrefsRecordingTabPanelProps) => {
//   return (
//     <div className={styles.container}>
//       <div className={styles.panelOptions}>
//         <div>row</div>
//         <div>row</div>
//       </div>
//       <div className={styles.panelButtons}>
//         <button type="button">Save</button>
//         <button type="button">Close</button>
//       </div>
//     </div>
//   );
// };
