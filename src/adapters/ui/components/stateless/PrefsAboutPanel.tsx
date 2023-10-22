import React from 'react';

import { shortcutForDisplay } from '@utils/shortcut';

import type { Preferences } from '@domain/models/preferences';

import styles from './PrefsAboutPanel.css';

type Props = {
  appName: string;
  version: string;
  prefs: Preferences;
};

function mapShortcutKeys(shortcut: string) {
  const keys = shortcutForDisplay(shortcut).split('+');
  return keys.map((k, i) => (
    <>
      <span className={styles.shortcutKey}>{k}</span>
      {i + 1 < keys.length && <span className={styles.shortcutPlus}>+</span>}
    </>
  ));
}

export function PrefsAboutPanel({ appName, version, prefs }: Props) {
  const { shortcut } = prefs;

  return (
    <div className={styles.container}>
      <div className={styles.appInfo}>
        <div className={styles.appTitle}>
          <h2>{appName}</h2>
          <p className={styles.version}>v{version}</p>
        </div>
      </div>
      <div className={styles.items}>
        <div key="shortcut" className={styles.item}>
          <h2>Recording Shortcut</h2>
          <p>{mapShortcutKeys(shortcut)}</p>
        </div>
      </div>
      <div className={styles.copyright}>
        <h2>Copyright @ 2021-2023 Pineple</h2>
      </div>
    </div>
  );
}
