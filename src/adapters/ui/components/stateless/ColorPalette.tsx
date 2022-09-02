/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import classNames from 'classnames';
import React, { useState, useCallback, useEffect } from 'react';

import styles from './ColorPalette.css';

const COLOR_PRESETS = [
  '#3B9F3D',
  '#FD6800',
  '#FDB800',
  '#7BDCB5',
  '#8ED1FC',
  '#0693E3',
  '#F78DA7',
  '#9955EF',
  '#EFEFEF',
  '#8B98A3',
];

interface ColorInputProps {
  defaultColor: string;
  onChange: (color: string) => void;
}

const ColorPalette = ({ defaultColor, onChange }: ColorInputProps) => {
  const [curColor, setCurColor] = useState(defaultColor);

  const handleChange = useCallback(
    (colorPicked: string) => {
      setCurColor(colorPicked);
      onChange(colorPicked);
    },
    [onChange]
  );

  useEffect(() => {
    setCurColor(defaultColor);
  }, [defaultColor]);

  return (
    <div>
      <div className={styles.container}>
        {COLOR_PRESETS.map((color: string) => (
          <div
            key={color}
            className={classNames(styles.colorBox, {
              [styles.colorBoxSelected]: color === curColor,
            })}
            onClick={() => handleChange(color)}
          >
            <div
              className={styles.color}
              style={{ backgroundColor: `${color}` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;
