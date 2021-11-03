/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import React, { useState, useCallback } from 'react';
import { RgbaStringColorPicker } from 'react-colorful';
import Color from 'color';

import useOnClickOutside from '@ui/hooks/hover';

import styles from './ColorInput.css';

interface ColorInputProps {
  defaultColor: string;
  onChange: (color: string) => void;
}

const ColorInput = ({ defaultColor, onChange }: ColorInputProps) => {
  const [rgbaColor, setRgbaColor] = useState(Color(defaultColor).string());
  const [showPicker, togglePicker] = useState(false);
  const picker = useOnClickOutside(() => {
    if (showPicker) {
      togglePicker(false);
    }
  });

  const handleChange = useCallback(
    (rgbaColorPicked: string) => {
      setRgbaColor(rgbaColorPicked);

      const color = Color(rgbaColorPicked);
      const hexAlpha = Math.floor(color.alpha() * 255).toString(16);
      const hexColor = `${color.hex()}${hexAlpha}`.toLowerCase();
      onChange(hexColor);
    },
    [onChange]
  );

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
