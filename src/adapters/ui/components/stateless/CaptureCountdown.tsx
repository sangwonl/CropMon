/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { FC } from 'react';
import Color from 'color';

import { Bounds } from '@domain/models/screen';

import { CaptureAreaColors } from '@application/models/ui';

import styles from '@adapters/ui/components/stateless/CaptureCountdown.css';

const COUNTDOWN_FONT_SMALL = 16;
const COUNTDOWN_FONT_MID = 50;
const COUNTDOWN_FONT_LARGE = 80;
const AREA_SIZE_SMALL = 40;
const AREA_SIZE_MID = 600;

const COLOR_ALPHA_AREA = 0.2;
const COLOR_ALPHA_AREA_SHADOW = 1.0;
const COLOR_ALPHA_TEXT_SHADOW = 0.3;

const getAreaStyles = (bounds: Bounds, colors: CaptureAreaColors): any => {
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

const getCountdownStyles = (bounds: Bounds, colors: CaptureAreaColors) => {
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
  targetBounds: Bounds;
  areaColors: CaptureAreaColors;
  countdown: number;
}

const CaptureCountdown: FC<PropTypes> = (props: PropTypes) => {
  const { targetBounds, countdown, areaColors } = props;

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.area}
        style={getAreaStyles(targetBounds, areaColors)}
      >
        {countdown > 0 && (
          <div
            className={styles.countdownText}
            style={getCountdownStyles(targetBounds, areaColors)}
          >
            {countdown}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaptureCountdown;
