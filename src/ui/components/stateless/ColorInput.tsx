/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import React, { useState, useCallback, useEffect } from 'react';
import { RgbaStringColorPicker } from 'react-colorful';
import Color from 'color';

import useOnClickOutside from '@ui/hooks/hover';

import styles from './ColorInput.css';

interface ColorInputProps {
  defaultColor: string;
  onChange: (color: string) => void;
}

const rgbaToHex = (rgba: string): string => {
  const color = Color(rgba);
  const hexAlpha = Math.floor(color.alpha() * 255).toString(16);
  return `${color.hex()}${hexAlpha}`.toLowerCase();
};

const hexToRgba = (hex: string): string => {
  return Color(hex).string();
};

const ColorInput = ({ defaultColor, onChange }: ColorInputProps) => {
  const [rgbaColor, setRgbaColor] = useState(hexToRgba(defaultColor));
  const [showPicker, togglePicker] = useState(false);
  const picker = useOnClickOutside(() => {
    if (showPicker) {
      togglePicker(false);
    }
  });

  const handleChange = useCallback(
    (rgbaColorPicked: string) => {
      setRgbaColor(rgbaColorPicked);
      onChange(rgbaToHex(rgbaColorPicked));
    },
    [onChange]
  );

  useEffect(() => {
    setRgbaColor(hexToRgba(defaultColor));
  }, [defaultColor]);

  return (
    <div>
      <div
        className={styles.container}
        onClick={() => togglePicker(!showPicker)}
      >
        <div
          className={styles.colorBox}
          style={{ backgroundColor: `${rgbaColor}` }}
        />
      </div>
      {showPicker && (
        <div ref={picker} className={styles.pickerCover}>
          <RgbaStringColorPicker color={rgbaColor} onChange={handleChange} />
        </div>
      )}
    </div>
  );
};

export default ColorInput;
