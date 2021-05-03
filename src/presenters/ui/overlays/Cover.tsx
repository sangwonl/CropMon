/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable import/prefer-default-export */

import React, { MouseEvent, useState, useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@presenters/redux/store';
import { IOverlaysWindows } from '@presenters/redux/ui/types';
import { getCurWindowCustomData } from '@utils/custom';

import { CaptureArea, AreaSelectionCtx } from './CaptureArea';

import styles from './Cover.css';

const initialSelectionCtx: AreaSelectionCtx = {
  started: false,
  selected: false,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
  curX: 0,
  curY: 0,
};

const stretchBodySize = (w: number, h: number) => {
  document.body.style.width = `${w}px`;
  document.body.style.height = `${h}px`;
};

export const Cover = () => {
  const overlaysWindows: IOverlaysWindows = useSelector(
    (state: RootState) => state.ui.overlaysWindows
  );

  const [selectionCtx, setSelectionCtx] = useState<AreaSelectionCtx>(
    initialSelectionCtx
  );

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setSelectionCtx({
      ...selectionCtx,
      started: true,
      selected: false,
      startX: e.clientX,
      startY: e.clientY,
      curX: e.clientX,
      curY: e.clientY,
    });
  };

  const handleMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    setSelectionCtx({
      ...selectionCtx,
      selected: true,
      endX: e.clientX,
      endY: e.clientY,
      curX: e.clientX,
      curY: e.clientY,
    });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    setSelectionCtx({
      ...selectionCtx,
      curX: e.clientX,
      curY: e.clientY,
    });
  };

  useLayoutEffect(() => {
    if (
      overlaysWindows === undefined ||
      Object.keys(overlaysWindows).length === 0
    ) {
      return;
    }

    const screenId = getCurWindowCustomData<number>('screenId');
    const { screenInfo } = overlaysWindows[screenId];
    stretchBodySize(screenInfo.width, screenInfo.height);
  }, [overlaysWindows]);

  return (
    <div
      className={styles.cursor}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      <CaptureArea ctx={selectionCtx} />
    </div>
  );
};
