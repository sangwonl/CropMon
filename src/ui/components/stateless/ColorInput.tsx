/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import React, { useState, useCallback } from 'react';
import { RgbaStringColorPicker } from 'react-colorful';

import useOnClickOutside from '@ui/hooks/hover';

import styles from './ColorInput.css';

interface ColorInputProps {
  defaultColor: string;
  onChange: (color: string) => void;
}

const ColorInput = ({ defaultColor, onChange }: ColorInputProps) => {
  const [color, setColor] = useState(defaultColor);
  const [showPicker, togglePicker] = useState(false);
  const picker = useOnClickOutside(() => {
    if (showPicker) {
      togglePicker(false);
    }
  });

  const handleChange = useCallback(
    (hexColor: string) => {
      setColor(hexColor);
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
          style={{ backgroundColor: `${color}` }}
        />
      </div>
      {showPicker && (
        <div ref={picker} className={styles.pickerCover}>
          <RgbaStringColorPicker color={color} onChange={handleChange} />
        </div>
      )}
    </div>
  );
};

export default ColorInput;
