/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, {
  MouseEvent,
  Dispatch,
  SetStateAction,
  FC,
  useState,
  useEffect,
} from 'react';
import classNames from 'classnames';
import Color from 'color';

import { IBounds, IPoint } from '@core/entities/screen';
import { ICaptureAreaColors } from '@core/entities/ui';
import styles from '@ui/components/stateless/CaptureTargeting.css';
import { SPARE_PIXELS, isEmptyBounds, isCapturableBounds } from '@utils/bounds';

const COLOR_ALPHA_AREA = 0.2;
const COLOR_ALPHA_AREA_SHADOW = 1.0;
const COLOR_ALPHA_TEXT_SHADOW = 0.3;

interface IAreaSelectionCtx {
  started: boolean;
  selected: boolean;
  startPt: IPoint;
  endPt: IPoint;
  curPt: IPoint;
  curScreenPt: IPoint;
}

const initialSelCtx: IAreaSelectionCtx = {
  started: false,
  selected: false,
  startPt: { x: 0, y: 0 },
  endPt: { x: 0, y: 0 },
  curPt: { x: 0, y: 0 },
  curScreenPt: { x: 0, y: 0 },
};

const calcSelectedBounds = (selCtx: IAreaSelectionCtx): IBounds => {
  const endX = selCtx.selected ? selCtx.endPt.x : selCtx.curPt.x;
  const endY = selCtx.selected ? selCtx.endPt.y : selCtx.curPt.y;
  return {
    x: Math.min(selCtx.startPt.x, endX) - SPARE_PIXELS,
    y: Math.min(selCtx.startPt.y, endY) - SPARE_PIXELS,
    width: Math.abs(endX - selCtx.startPt.x) + 1,
    height: Math.abs(endY - selCtx.startPt.y) + 1,
  };
};

const getAreaStyles = (
  selCtx: IAreaSelectionCtx,
  bounds: IBounds,
  colors: ICaptureAreaColors
): any => {
  const layoutStyle = {
    left: bounds.x + SPARE_PIXELS - 1,
    top: bounds.y + SPARE_PIXELS - 1,
    width: bounds.width + 2,
    height: bounds.height + 2,
  };

  if (!selCtx.started || isEmptyBounds(bounds)) {
    return layoutStyle;
  }

  if (!selCtx.selected) {
    if (isCapturableBounds(bounds)) {
      const color = Color(colors.selectingBackground);
      return {
        ...layoutStyle,
        backgroundColor: color.alpha(COLOR_ALPHA_AREA).string(),
        boxShadow: `inset 0 0 1px ${color
          .alpha(COLOR_ALPHA_AREA_SHADOW)
          .string()}`,
      };
    }
    return {
      ...layoutStyle,
      backgroundColor: '#ff00001a',
      boxShadow: 'inset 0 0 1px #ff0000',
    };
  }

  return layoutStyle;
};

const CURSOR_HINT_BOX_SIZE = { width: 60, height: 10 };
const CURSOR_HINT_BOX_PAD = 4;
const getCursorHintStyles = (
  selCtx: IAreaSelectionCtx,
  bounds: IBounds,
  colors: ICaptureAreaColors
): any => {
  const colorStyle = {
    color: colors.selectingText,
    textShadow: `${Color(colors.selectingBackground)
      .alpha(COLOR_ALPHA_TEXT_SHADOW)
      .string()} 0px 0px 1px`,
  };

  if (!selCtx.started || !isCapturableBounds(bounds)) {
    return {
      display: 'none',
    };
  }

  const { startPt, curPt } = selCtx;
  if (curPt.x > startPt.x) {
    // right-bottom
    if (curPt.y > startPt.y) {
      return {
        ...CURSOR_HINT_BOX_SIZE,
        ...colorStyle,
        left: curPt.x - (CURSOR_HINT_BOX_SIZE.width + CURSOR_HINT_BOX_PAD),
        top: curPt.y - (CURSOR_HINT_BOX_SIZE.height + CURSOR_HINT_BOX_PAD),
        textAlign: 'right',
      };
    }

    // right-top
    return {
      ...CURSOR_HINT_BOX_SIZE,
      ...colorStyle,
      left: curPt.x - (CURSOR_HINT_BOX_SIZE.width + CURSOR_HINT_BOX_PAD),
      top: curPt.y + CURSOR_HINT_BOX_PAD,
      textAlign: 'right',
    };
  }

  // left-bottom
  if (curPt.y > startPt.y) {
    return {
      ...CURSOR_HINT_BOX_SIZE,
      ...colorStyle,
      left: curPt.x + CURSOR_HINT_BOX_PAD,
      top: curPt.y - (CURSOR_HINT_BOX_SIZE.height + CURSOR_HINT_BOX_PAD),
    };
  }

  // left-top
  return {
    ...CURSOR_HINT_BOX_SIZE,
    ...colorStyle,
    left: curPt.x + CURSOR_HINT_BOX_PAD,
    top: curPt.y + CURSOR_HINT_BOX_PAD,
  };
};

const handleMouseDown = (
  e: MouseEvent<HTMLDivElement>,
  getScreenPoint: () => IPoint,
  onStart: () => void,
  onCancel: () => void,
  selCtx: IAreaSelectionCtx,
  setSelCtx: Dispatch<SetStateAction<IAreaSelectionCtx>>
) => {
  // if click after already area settled or right click while selecting
  if (selCtx.selected || e.button === 2) {
    setSelCtx(initialSelCtx);
    onCancel();
    return;
  }

  setSelCtx({
    ...selCtx,
    started: true,
    startPt: { x: e.clientX, y: e.clientY },
    curPt: { x: e.clientX, y: e.clientY },
    curScreenPt: getScreenPoint(),
  });

  onStart();
};

const handleMouseUp = (
  e: MouseEvent<HTMLDivElement>,
  getScreenPoint: () => IPoint,
  onCancel: () => void,
  onFinish: (boundsForUi: IBounds, boundsForCapture: IBounds) => void,
  selCtx: IAreaSelectionCtx,
  setSelCtx: Dispatch<SetStateAction<IAreaSelectionCtx>>
) => {
  // if click after already area settled or right click while selecting
  if (!selCtx.started || selCtx.selected || e.button === 2) {
    setSelCtx(initialSelCtx);
    onCancel();
    return;
  }

  const updatedSelCtx = {
    ...selCtx,
    endPt: { x: e.clientX, y: e.clientY },
    curPt: { x: e.clientX, y: e.clientY },
  };

  const boundsForUi = calcSelectedBounds(updatedSelCtx);
  if (selCtx.started && !isCapturableBounds(boundsForUi)) {
    setSelCtx(initialSelCtx);
    onCancel();
    return;
  }

  updatedSelCtx.selected = true;
  setSelCtx(updatedSelCtx);

  const curScreenPt = getScreenPoint();
  const boundsForCapture = {
    x: Math.min(updatedSelCtx.curScreenPt.x, curScreenPt.x),
    y: Math.min(updatedSelCtx.curScreenPt.y, curScreenPt.y),
    width: Math.abs(curScreenPt.x - updatedSelCtx.curScreenPt.x) + 1,
    height: Math.abs(curScreenPt.y - updatedSelCtx.curScreenPt.y) + 1,
  };
  onFinish(boundsForUi, boundsForCapture);
};

const handleMouseMove = (
  e: MouseEvent<HTMLDivElement>,
  selCtx: IAreaSelectionCtx,
  setSelCtx: Dispatch<SetStateAction<IAreaSelectionCtx>>
) => {
  if (!selCtx.started) {
    return;
  }

  setSelCtx({
    ...selCtx,
    curPt: { x: e.clientX, y: e.clientY },
  });
};

interface PropTypes {
  areaColors: ICaptureAreaColors;
  getScreenPoint: () => IPoint;
  onStart: () => void;
  onCancel: () => void;
  onFinish: (boundsForUi: IBounds, boundsForCapture: IBounds) => void;
}

const CaptureTargeting: FC<PropTypes> = (props: PropTypes) => {
  const { areaColors, getScreenPoint, onStart, onFinish, onCancel } = props;

  const [selCtx, setSelCtx] = useState<IAreaSelectionCtx>(initialSelCtx);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.code === 'Escape') {
        if (selCtx.selected) {
          return;
        }

        setSelCtx(initialSelCtx);
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selCtx.selected]);

  const calcBounds = calcSelectedBounds(selCtx);

  return (
    <div
      className={classNames({
        [styles.wrapper]: true,
        [styles.wrapperHack]: !selCtx.selected,
        [styles.cursorSelecting]: !selCtx.selected,
      })}
      onMouseDown={(e: MouseEvent<HTMLDivElement>) =>
        handleMouseDown(e, getScreenPoint, onStart, onCancel, selCtx, setSelCtx)
      }
      onMouseUp={(e: MouseEvent<HTMLDivElement>) =>
        handleMouseUp(e, getScreenPoint, onCancel, onFinish, selCtx, setSelCtx)
      }
      onMouseMove={(e: MouseEvent<HTMLDivElement>) =>
        handleMouseMove(e, selCtx, setSelCtx)
      }
    >
      <>
        <div
          className={classNames(styles.area, {
            [styles.areaHidden]: !selCtx.started || isEmptyBounds(calcBounds),
          })}
          style={getAreaStyles(selCtx, calcBounds, areaColors)}
        />
        {!selCtx.selected && (
          <div
            className={styles.cursorSizeHint}
            style={getCursorHintStyles(selCtx, calcBounds, areaColors)}
          >
            {calcBounds.width}x{calcBounds.height}
          </div>
        )}
      </>
    </div>
  );
};

export default CaptureTargeting;
