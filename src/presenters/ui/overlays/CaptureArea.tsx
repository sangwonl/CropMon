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

import { isEmptyBounds, isCapturableBounds, emptyBounds } from '@utils/bounds';

import { SelectedBounds } from './types';
import { CaptureAreaHint } from './CaptureAreaHint';
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
    width: Math.abs(endX - selCtx.startX) + 1,
    height: Math.abs(endY - selCtx.startY) + 1,
  };
};

const getAreaClasses = (
  bounds: SelectedBounds,
  selCtx: AreaSelectionCtx
): string => {
  if (isEmptyBounds(bounds)) {
    return styles.areaHidden;
  }

  if (!isCapturableBounds(bounds)) {
    return classNames(styles.area, styles.areaUncapturable);
  }

  if (selCtx.selected) {
    return classNames(styles.area, styles.areaSelected);
  }

  return styles.area;
};

const getAreaLayout = (bounds: SelectedBounds): any => {
  return {
    left: bounds.x,
    top: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };
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

  useEffect(() => {
    setSelCtx({ ...selCtx, selected: selectedBounds !== undefined });
  }, [selectedBounds]);

  const onMouseDown = handleMouseDown(onStart, onCancel, selCtx, setSelCtx);
  const onMouseUp = handleMouseUp(onCancel, onFinish, selCtx, setSelCtx);
  const onMouseMove = handleMouseMove(selCtx, setSelCtx);
  const calcBounds = calcSelectedBounds(selCtx);

  return (
    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
    <div
      className={classNames({
        [styles.wrapper]: true,
        [styles.crosshair]: !selCtx.selected,
      })}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    >
      {active && (
        <>
          <div
            className={getAreaClasses(calcBounds, selCtx)}
            style={getAreaLayout(calcBounds)}
          />
          <CaptureAreaHint selectedBounds={calcBounds} />
        </>
      )}
    </div>
  );
};

CaptureArea.defaultProps = {
  selectedBounds: undefined,
};
