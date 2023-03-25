/* eslint-disable jsx-a11y/click-events-have-key-events */
import classNames from 'classnames';
import React, { useCallback } from 'react';

import { License } from '@domain/models/license';

import styles from './PrefsTabPanels.css';

type Props = {
  version: string;
  license: License | null;
  shortcut: string;
  onRegister: (licenseKey: string) => void;
};

function mapShortcutKeys(shortcut: string) {
  const keys = shortcut.split('+');
  return keys.map((k, i) => (
    <>
      <span className={styles.aboutShortcutKey}>{k}</span>
      {i + 1 < keys.length && (
        <span className={styles.aboutShortcutPlus}>+</span>
      )}
    </>
  ));
}

function PrefsAboutPanel({ license, version, shortcut, onRegister }: Props) {
  const handlePurchaseClick = useCallback(() => {
    window.open('https://kropsaurus.pineple.com', '_blank');
  }, []);

  const handleRegisterClick = useCallback(() => {}, []);

  return (
    <div className={styles.aboutContainer}>
      <div className={styles.aboutAppInfo}>
        <div className={styles.aboutAppTitle}>
          <h2>Kropsaurus</h2>
          <p className={styles.aboutVersion}>v{version}</p>
        </div>
        <p
          className={classNames(styles.aboutLicense, {
            [styles.aboutLicenseUnregistered]: !license?.validated,
          })}
        >
          {license?.validated ? 'Registered' : 'Unregistered'}
        </p>
      </div>
      <div className={styles.aboutItems}>
        <div className={styles.aboutItem}>
          <h2>Recording Shortcut</h2>
          <p>{mapShortcutKeys(shortcut)}</p>
        </div>
        {!license?.validated && (
          <div className={styles.aboutItem}>
            <h2>Registration</h2>
            <p className={styles.aboutRegDesc}>
              <span
                className={styles.aboutRegLink}
                onClick={handlePurchaseClick}
              >
                Click here
              </span>{' '}
              to purchase lifetime license.
            </p>
            <p className={styles.aboutRegDesc}>
              <span
                className={styles.aboutRegLink}
                onClick={handleRegisterClick}
              >
                Click here
              </span>{' '}
              to register existing license.
            </p>
          </div>
        )}
      </div>
      <div className={styles.aboutCopyright}>
        <h2>Copyright @2023 Pineple</h2>
      </div>
    </div>
  );
}

export default PrefsAboutPanel;
