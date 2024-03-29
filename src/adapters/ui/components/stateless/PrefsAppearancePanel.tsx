import React, { useState, useCallback } from 'react';

import type { Preferences } from '@domain/models/preferences';

import { ColorPalette } from '@adapters/ui/components/stateless/ColorPalette';

import commStyles from './CommonStyles.css';
import styles from './PrefsTabPanels.css';

type Props = {
  prefs: Preferences;
  onSave: (prefs: Preferences) => void;
  onCancel: () => void;
};

type OptionType = string | number | boolean;
const isChanged = (a: OptionType, b: OptionType) => a !== b;

export function PrefsAppearancesPanel({ prefs, onSave, onCancel }: Props) {
  const [colorSelectingBg, setColorSelectingBg] = useState(
    prefs.colors.selectingBackground,
  );

  const [colorSelectingText, setColorSelectingText] = useState(
    prefs.colors.selectingText,
  );

  const [colorCountdownBg, setColorCountdownBg] = useState(
    prefs.colors.countdownBackground,
  );

  const [colorCountdownText, setColorCountdownText] = useState(
    prefs.colors.countdownText,
  );

  const canSave = useCallback(() => {
    const { colors: initialColors } = prefs;
    return (
      isChanged(initialColors.selectingBackground, colorSelectingBg) ||
      isChanged(initialColors.selectingText, colorSelectingText) ||
      isChanged(initialColors.countdownBackground, colorCountdownBg) ||
      isChanged(initialColors.countdownText, colorCountdownText)
    );
  }, [
    colorCountdownBg,
    colorCountdownText,
    colorSelectingBg,
    colorSelectingText,
    prefs,
  ]);

  const handleSave = useCallback(() => {
    const newPrefs: Preferences = {
      ...prefs,
      colors: {
        selectingBackground: colorSelectingBg,
        selectingText: colorSelectingText,
        countdownBackground: colorCountdownBg,
        countdownText: colorCountdownText,
      },
    };
    onSave(newPrefs);
  }, [
    colorCountdownBg,
    colorCountdownText,
    colorSelectingBg,
    colorSelectingText,
    prefs,
    onSave,
  ]);

  return (
    <div className={styles.container}>
      <div className={styles.panelOptions}>
        <fieldset>
          <legend>Customize capture area colors</legend>
          <div className={styles.optionRow}>
            <div className={styles.colorInput}>
              <label htmlFor="opt-color-capt-area-selecting-bg">
                Selecting Area:
              </label>
              <div id="opt-color-capt-area-selecting-bg">
                <ColorPalette
                  defaultColor={colorSelectingBg}
                  onChange={setColorSelectingBg}
                />
              </div>
            </div>
          </div>
          <div className={styles.optionRow}>
            <div className={styles.colorInput}>
              <label htmlFor="opt-color-capt-area-selecting-text">
                Selecting Text:
              </label>
              <div id="opt-color-capt-area-selecting-text">
                <ColorPalette
                  defaultColor={colorSelectingText}
                  onChange={setColorSelectingText}
                />
              </div>
            </div>
          </div>
          <div className={styles.optionRow}>
            <div className={styles.colorInput}>
              <label htmlFor="opt-color-capt-area-countdown-bg">
                Countdown Area:
              </label>
              <div id="opt-color-capt-area-countdown-bg">
                <ColorPalette
                  defaultColor={colorCountdownBg}
                  onChange={setColorCountdownBg}
                />
              </div>
            </div>
          </div>
          <div className={styles.optionRow}>
            <div className={styles.colorInput}>
              <label htmlFor="opt-color-capt-area-countdown-num">
                Countdown Text:
              </label>
              <div id="opt-color-capt-area-countdown-num">
                <ColorPalette
                  defaultColor={colorCountdownText}
                  onChange={setColorCountdownText}
                />
              </div>
            </div>
          </div>
        </fieldset>
      </div>
      <div className={styles.panelButtons}>
        <button
          type="button"
          className={commStyles.primaryBtn}
          disabled={!canSave()}
          onClick={handleSave}
        >
          Save
        </button>
        <button
          tabIndex={1}
          type="button"
          className={commStyles.secondaryBtn}
          onClick={onCancel}
        >
          Close
        </button>
      </div>
    </div>
  );
}
