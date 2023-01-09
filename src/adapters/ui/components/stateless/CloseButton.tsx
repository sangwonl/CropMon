import React from 'react';

import { withStopPropagation } from '@utils/events';

import closeIcon from '@assets/close.png';

import styles from './CloseButton.css';

type Props = {
  onClick: () => void;
};

function CloseButton({ onClick }: Props) {
  return (
    <button
      type="button"
      className={styles.btn}
      onMouseUp={(e) => withStopPropagation(e)}
      onMouseDown={(e) => withStopPropagation(e)}
      onClick={(e) => withStopPropagation(e, onClick)}
    >
      <img src={closeIcon} alt="Close" />
    </button>
  );
}

export default CloseButton;
