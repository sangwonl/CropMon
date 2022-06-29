/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { MouseEvent, FC, useCallback } from 'react';
import classNames from 'classnames';
import Color from 'color';

import { Bounds } from '@domain/models/screen';

import { CaptureAreaColors } from '@application/models/ui';

import { isCapturableBounds } from '@utils/bounds';

import styles from '@adapters/ui/components/stateless/CaptureTargetingScreen.css';

const COLOR_ALPHA_AREA = 0.2;
const COLOR_ALPHA_AREA_SHADOW = 1.0;

const getAreaStyles = (bounds: Bounds, colors: CaptureAreaColors): any => {
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

interface PropTypes {
  areaColors: CaptureAreaColors;
  screenBounds: Bounds;
  onStart: () => void;
  onCancel: () => void;
  onFinish: () => void;
}

const CaptureTargetingScreen: FC<PropTypes> = (props: PropTypes) => {
  const { areaColors, screenBounds, onStart, onCancel, onFinish } = props;

  const handleMouseEvent = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.button === 0) {
        onStart();
        onFinish();
      } else if (e.button === 2) {
        onCancel();
      }
    },
    [screenBounds]
  );

  return (
    <div className={classNames(styles.wrapper)} onMouseUp={handleMouseEvent}>
      <div
        className={styles.area}
        style={getAreaStyles(screenBounds, areaColors)}
      />
    </div>
  );
};

export default CaptureTargetingScreen;
