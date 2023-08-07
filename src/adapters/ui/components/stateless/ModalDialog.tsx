import React, { type ReactNode } from 'react';

import styles from './ModalDialog.css';

type Props = {
  children: ReactNode;
};

function ModalDialog({ children }: Props) {
  return (
    <div className={styles.modal}>
      <div className={styles.container}>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default ModalDialog;
