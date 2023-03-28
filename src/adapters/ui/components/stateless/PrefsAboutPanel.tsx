/* eslint-disable jsx-a11y/click-events-have-key-events */
import classNames from 'classnames';
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { shortcutForDisplay } from '@utils/shortcut';

import { License } from '@domain/models/license';
import { Preferences } from '@domain/models/preferences';

import ModalDialog from '@adapters/ui/components/stateless/ModalDialog';

import commStyles from './CommonStyles.css';
import styles from './PrefsAboutPanel.css';

const LINK_LICENSE_BUY = 'https://kropsaurus.pineple.com/buy';

type Props = {
  version: string;
  prefs: Preferences;
  license: License | null;
  registerError: string | null;
  onRegister: (email: string, licenseKey: string) => void;
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

function mapTimestampToDateString(timestamp: number): string {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function PrefsAboutPanel({
  version,
  prefs,
  license,
  registerError,
  onRegister,
}: Props) {
  const { shortcut } = prefs;

  const [showRegModal, setShowRegModal] = useState(false);
  const [licenseText, setLicenseText] = useState<string>('');
  const licenseTextRef = useRef<HTMLTextAreaElement>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLicenseTextChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setLicenseText(e.target.value);
      setErrorText(null);
    },
    []
  );

  const handleLicenseRegister = useCallback(() => {
    setLoading(true);
    const licenseKey = licenseTextRef.current?.value ?? '';
    onRegister('', licenseKey);
  }, [onRegister]);

  const handleRegModalClose = useCallback(() => {
    setShowRegModal(false);
  }, []);

  const handleRegModalOpen = useCallback(() => {
    setShowRegModal(true);
    setLicenseText('');
    setErrorText(null);
    setLoading(false);
  }, []);

  const handlePurchaseClick = useCallback(() => {
    window.open(LINK_LICENSE_BUY, '_blank');
  }, []);

  useEffect(() => {
    if (!registerError && license?.validated) {
      setShowRegModal(false);
    } else {
      setErrorText(registerError);
    }
    setLoading(false);
  }, [license, registerError]);

  return (
    <div className={styles.container}>
      <div className={styles.appInfo}>
        <div className={styles.appTitle}>
          <h2>Kropsaurus</h2>
          <p className={styles.version}>v{version}</p>
        </div>
        <p
          className={classNames(styles.license, {
            [styles.licenseUnregistered]: !license?.validated,
          })}
        >
          {license?.validated ? 'Registered' : 'Unregistered'}
        </p>
      </div>
      <div className={styles.items}>
        <div key="shortcut" className={styles.item}>
          <h2>Recording Shortcut</h2>
          <p>{mapShortcutKeys(shortcut)}</p>
        </div>
        <div key="license" className={styles.item}>
          <h2>Lifetime License</h2>
          {license?.validated && (
            <p className={styles.regDesc}>
              The license was registered to{' '}
              <span className={styles.regEmail}>{license.email}</span> on{' '}
              <span className={styles.regDate}>
                {mapTimestampToDateString(license.registeredAt)}
              </span>
              .
            </p>
          )}
          {!license?.validated && (
            <p className={styles.regDesc}>
              <span className={styles.regLink} onClick={handleRegModalOpen}>
                Register
              </span>{' '}
              an existing license. (
              <span className={styles.regLink} onClick={handlePurchaseClick}>
                Click here
              </span>{' '}
              to purchase a license)
            </p>
          )}
        </div>
      </div>
      <div className={styles.copyright}>
        <h2>Copyright @2023 Pineple</h2>
      </div>
      {showRegModal && (
        <ModalDialog>
          <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>Enter License</div>
            <div className={styles.modalBody}>
              <textarea
                ref={licenseTextRef}
                className={styles.modalLicenseText}
                value={licenseText}
                onChange={handleLicenseTextChange}
              />
            </div>
            <div className={styles.modalFooter}>
              <p className={styles.modalRegisterResult}>
                {loading && <span className={commStyles.spinner} />}
                {!loading && errorText && (
                  <span className={styles.modalRegisterError}>{errorText}</span>
                )}
              </p>
              <div className={styles.modalButtons}>
                <button
                  type="button"
                  className={commStyles.primaryBtn}
                  disabled={!!errorText || !licenseText}
                  onClick={handleLicenseRegister}
                >
                  Register
                </button>
                <button
                  type="button"
                  className={commStyles.secondaryBtn}
                  onClick={handleRegModalClose}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </ModalDialog>
      )}
    </div>
  );
}

export default PrefsAboutPanel;
