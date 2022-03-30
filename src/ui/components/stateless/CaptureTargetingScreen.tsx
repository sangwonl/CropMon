/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { MouseEvent, FC, useCallback } from 'react';
import classNames from 'classnames';
import Color from 'color';

import { IBounds } from '@core/entities/screen';
import { ICaptureAreaColors } from '@core/entities/ui';
import { getBoundsFromZero, isCapturableBounds } from '@utils/bounds';

import styles from '@ui/components/stateless/CaptureTargetingScreen.css';

const COLOR_ALPHA_AREA = 0.2;
const COLOR_ALPHA_AREA_SHADOW = 1.0;

const getAreaStyles = (bounds: IBounds, colors: ICaptureAreaColors): any => {
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
  areaColors: ICaptureAreaColors;
  screenBounds: IBounds;
  onStart: () => void;
  onCancel: () => void;
  onFinish: (boundsForUi: IBounds, boundsForCapture: IBounds) => void;
}

const CaptureTargetingScreen: FC<PropTypes> = (props: PropTypes) => {
  const { areaColors, screenBounds, onStart, onCancel, onFinish } = props;

  const handleMouseEvent = useCallback(
    (e: MouseEvent<HTMLDivElement>, isDown: boolean) => {
      if (e.button === 0) {
        if (isDown) {
          onStart();
        } else {
          onFinish(getBoundsFromZero(screenBounds), screenBounds);
        }
      } else if (e.button === 2 && !isDown) {
        onCancel();
      }
    },
    [screenBounds]
  );

  return (
    <div
      className={classNames(styles.wrapper)}
      onMouseDown={(e: MouseEvent<HTMLDivElement>) => handleMouseEvent(e, true)}
      onMouseUp={(e: MouseEvent<HTMLDivElement>) => handleMouseEvent(e, false)}
    >
      <div
        className={styles.area}
        style={getAreaStyles(screenBounds, areaColors)}
      />
    </div>
  );
};

export default CaptureTargetingScreen;
