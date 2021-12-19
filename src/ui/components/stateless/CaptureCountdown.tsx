/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { FC, useEffect } from 'react';
import Color from 'color';

import { IBounds } from '@core/entities/screen';
import { ICaptureAreaColors } from '@core/entities/ui';
import styles from '@ui/components/stateless/CaptureCountdown.css';

const COUNTDOWN_FONT_SMALL = 16;
const COUNTDOWN_FONT_MID = 50;
const COUNTDOWN_FONT_LARGE = 80;
const AREA_SIZE_SMALL = 40;
const AREA_SIZE_MID = 600;

const COLOR_ALPHA_AREA = 0.2;
const COLOR_ALPHA_AREA_SHADOW = 1.0;
const COLOR_ALPHA_TEXT_SHADOW = 0.3;

const getAreaStyles = (bounds: IBounds, colors: ICaptureAreaColors): any => {
  const layoutStyle = {
    left: bounds.x - 1,
    top: bounds.y - 1,
    width: bounds.width + 2,
    height: bounds.height + 2,
  };

  const color = Color(colors.countdownBackground);
  return {
    ...layoutStyle,
    backgroundColor: color.alpha(COLOR_ALPHA_AREA).string(),
    boxShadow: `inset 0 0 1px ${color.alpha(COLOR_ALPHA_AREA_SHADOW).string()}`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };
};

const getCountdownStyles = (bounds: IBounds, colors: ICaptureAreaColors) => {
  const colorStyle = {
    color: colors.countdownText,
    textShadow: `${Color(colors.countdownBackground)
      .alpha(COLOR_ALPHA_TEXT_SHADOW)
      .string()} 1px 2px 2px`,
  };

  const { width, height } = bounds;
  if (width < AREA_SIZE_SMALL && height < AREA_SIZE_SMALL) {
    return {
      ...colorStyle,
      fontSize: COUNTDOWN_FONT_SMALL,
    };
  }
  if (width < AREA_SIZE_MID && height < AREA_SIZE_MID) {
    return {
      ...colorStyle,
      fontSize: COUNTDOWN_FONT_MID,
    };
  }
  return {
    ...colorStyle,
    fontSize: COUNTDOWN_FONT_LARGE,
  };
};

interface PropTypes {
  selectedBounds: IBounds;
  countdown: number;
  areaColors: ICaptureAreaColors;
  onCancel: () => void;
}

const CaptureCountdown: FC<PropTypes> = (props: PropTypes) => {
  const { selectedBounds, countdown, areaColors, onCancel } = props;

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
  }, [onCancel]);

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.area}
        style={getAreaStyles(selectedBounds, areaColors)}
      >
        <div
          className={styles.countdownText}
          style={getCountdownStyles(selectedBounds, areaColors)}
        >
          {countdown}
        </div>
      </div>
    </div>
  );
};

export default CaptureCountdown;
