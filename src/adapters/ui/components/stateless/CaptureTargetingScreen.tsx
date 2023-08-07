import Color from 'color';
import React, { type MouseEvent, useCallback } from 'react';

import { isCapturableBounds } from '@utils/bounds';

import type { Bounds, Point } from '@domain/models/screen';

import type { CaptureAreaColors } from '@application/models/ui';

import styles from './CaptureTargetingScreen.css';

const COLOR_ALPHA_AREA = 0.2;
const COLOR_ALPHA_AREA_SHADOW = 1.0;

const getAreaStyles = (
  bounds: Bounds,
  colors: CaptureAreaColors,
): { [key: string]: number | string } => {
  const layoutStyle = {
    left: 0,
    top: 0,
    width: bounds.width,
    height: bounds.height,
  };

  if (isCapturableBounds(bounds)) {
    const color = Color(colors.selectingBackground);
    const bgColor = color.alpha(COLOR_ALPHA_AREA).string();
    const shadowColor = color.alpha(COLOR_ALPHA_AREA_SHADOW).string();
    return {
      ...layoutStyle,
      backgroundColor: bgColor,
      boxShadow: `inset 0 0 1px ${shadowColor}`,
    };
  }

  return layoutStyle;
};

type Props = {
  targetBounds: Bounds;
  areaColors: CaptureAreaColors;
  onStart: (cursorPosition: Point) => void;
  onCancel: () => void;
  onFinish: () => void;
};

function CaptureTargetingScreen(props: Props) {
  const { areaColors, targetBounds, onStart, onCancel, onFinish } = props;

  const handleMouseEvent = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.button === 0) {
        onStart({ x: e.screenX, y: e.screenY });
        onFinish();
      } else if (e.button === 2) {
        onCancel();
      }
    },
    [targetBounds],
  );

  return (
    <div
      className={styles.area}
      style={getAreaStyles(targetBounds, areaColors)}
      onMouseUp={handleMouseEvent}
    />
  );
}

export default CaptureTargetingScreen;
