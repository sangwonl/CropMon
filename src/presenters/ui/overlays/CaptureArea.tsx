/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import React, {
  useState,
  MouseEvent,
  Dispatch,
  SetStateAction,
  FC,
  useEffect,
} from 'react';
import classNames from 'classnames';
import { rgba } from 'polished';

import { isEmptyBounds, isCapturableBounds, emptyBounds } from '@utils/bounds';

import { SelectedBounds } from './types';

import styles from './CaptureArea.css';

interface PropTypes {
  active: boolean;
  selectedBounds?: SelectedBounds;
  onSelectionStart: () => void;
  onSelectionFinish: (bounds: SelectedBounds) => void;
  onSelectionCancel: () => void;
}

interface AreaSelectionCtx {
  started: boolean;
  selected: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  curX: number;
  curY: number;
}

const initialSelCtx: AreaSelectionCtx = {
  started: false,
  selected: false,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
  curX: 0,
  curY: 0,
};

const calcSelectedBounds = (selCtx: AreaSelectionCtx): SelectedBounds => {
  if (!selCtx.started) {
    return emptyBounds();
  }

  const endX = selCtx.selected ? selCtx.endX : selCtx.curX;
  const endY = selCtx.selected ? selCtx.endY : selCtx.curY;
  return {
    x: Math.min(selCtx.startX, endX),
    y: Math.min(selCtx.startY, endY),
    width: Math.abs(endX - selCtx.startX),
    height: Math.abs(endY - selCtx.startY),
  };
};

const getSelectedAreaStyles = (selCtx: AreaSelectionCtx): any => {
  const bounds = calcSelectedBounds(selCtx);

  if (isEmptyBounds(bounds)) {
    return { display: 'none' };
  }

  let styles: any = {
    left: bounds.x,
    top: bounds.y,
    width: bounds.width + 1,
    height: bounds.height + 1,
  };

  if (!isCapturableBounds(bounds)) {
    styles = {
      ...styles,
      backgroundColor: rgba(255, 10, 10, 0.1),
      boxShadow: 'inset 0 0 3px red',
    };
  }

  if (selCtx.selected) {
    styles = {
      ...styles,
      backgroundColor: rgba(255, 255, 255, 0.01),
    };
  }

  return styles;
};

const handleMouseDown = (
  onSelectionStart: () => void,
  onSelectionCancel: () => void,
  selCtx: AreaSelectionCtx,
  setSelCtx: Dispatch<SetStateAction<AreaSelectionCtx>>
) => (e: MouseEvent<HTMLDivElement>) => {
  if (selCtx.selected) {
    setSelCtx(initialSelCtx);
    onSelectionCancel();
    return;
  }

  setSelCtx({
    ...selCtx,
    started: true,
    startX: e.clientX,
    startY: e.clientY,
    curX: e.clientX,
    curY: e.clientY,
  });

  onSelectionStart();
};

const handleMouseUp = (
  onSelectionCancel: () => void,
  onSelectionFinish: (bounds: SelectedBounds) => void,
  selCtx: AreaSelectionCtx,
  setSelCtx: Dispatch<SetStateAction<AreaSelectionCtx>>
) => (e: MouseEvent<HTMLDivElement>) => {
  const updatedSelCtx = {
    ...selCtx,
    endX: e.clientX,
    endY: e.clientY,
    curX: e.clientX,
    curY: e.clientY,
  };

  const bounds = calcSelectedBounds(updatedSelCtx);
  if (selCtx.started && !isCapturableBounds(bounds)) {
    setSelCtx(initialSelCtx);
    onSelectionCancel();
    return;
  }

  updatedSelCtx.selected = true;
  setSelCtx(updatedSelCtx);
  onSelectionFinish(bounds);
};

const handleMouseMove = (
  selCtx: AreaSelectionCtx,
  setSelCtx: Dispatch<SetStateAction<AreaSelectionCtx>>
) => (e: MouseEvent<HTMLDivElement>) => {
  setSelCtx({
    ...selCtx,
    curX: e.clientX,
    curY: e.clientY,
  });
};

export const CaptureArea: FC<PropTypes> = (props: PropTypes) => {
  const {
    active,
    selectedBounds,
    onSelectionStart: onStart,
    onSelectionFinish: onFinish,
    onSelectionCancel: onCancel,
  } = props;

  const [selCtx, setSelCtx] = useState<AreaSelectionCtx>(initialSelCtx);

  const mouseDownHandler = handleMouseDown(
    onStart,
    onCancel,
    selCtx,
    setSelCtx
  );
  const mouseUpHandler = handleMouseUp(onCancel, onFinish, selCtx, setSelCtx);
  const mouseMoveHandler = handleMouseMove(selCtx, setSelCtx);

  useEffect(() => {
    setSelCtx({ ...selCtx, selected: selectedBounds !== undefined });
  }, [selectedBounds]);

  const wrapperClasses = classNames({
    [styles.wrapper]: true,
    [styles.crosshair]: !selCtx.selected,
  });

  return (
    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
    <div
      className={wrapperClasses}
      onMouseDown={mouseDownHandler}
      onMouseUp={mouseUpHandler}
      onMouseMove={mouseMoveHandler}
    >
      {active && (
        <div className={styles.area} style={getSelectedAreaStyles(selCtx)} />
      )}
    </div>
  );
};

CaptureArea.defaultProps = {
  selectedBounds: undefined,
};
