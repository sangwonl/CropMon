/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React from 'react';
// import { useDispatch, useSelector } from 'react-redux';

import CaptureOptionPanel from '@ui/components/stateless/CaptureOptionPanel';

import styles from '@ui/components/stateful/ControlPanel.css';

const ControlPanel = () => {
  // const dispatch = useDispatch();

  // const captureOverlay: ICaptureOverlay = useSelector(
  //   (state: RootState) => state.ui.root.captureOverlay
  // );

  return (
    <div className={styles.container}>
      <CaptureOptionPanel />
    </div>
  );
};

export default ControlPanel;
