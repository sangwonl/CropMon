/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { MouseEvent, FC, useEffect, useCallback } from 'react';
import classNames from 'classnames';
import Color from 'color';

import { IBounds } from '@core/entities/screen';
import { ICaptureAreaColors } from '@core/entities/ui';
import { SPARE_PIXELS, isCapturableBounds } from '@utils/bounds';

import styles from '@ui/components/stateless/CaptureTargetingScreen.css';

const COLOR_ALPHA_AREA = 0.2;
const COLOR_ALPHA_AREA_SHADOW = 1.0;

const getAreaStyles = (bounds: IBounds, colors: ICaptureAreaColors): any => {
  const layoutStyle = {
    left: bounds.x + SPARE_PIXELS - 1,
    top: bounds.y + SPARE_PIXELS - 1,
    width: bounds.width + 2,
    height: bounds.height + 2,
  };

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
          onFinish(screenBounds, screenBounds);
        }
      } else if (e.button === 2 && !isDown) {
        onCancel();
      }
    },
    [screenBounds]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.code === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <div
      className={classNames(styles.wrapper, styles.wrapperHack)}
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
