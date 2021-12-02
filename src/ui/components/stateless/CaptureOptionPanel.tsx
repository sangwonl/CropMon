import React, { FC } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PropTypes {}

const CaptureOptionPanel: FC<PropTypes> = (props: PropTypes) => {
  return (
    <div
      style={{
        width: 300,
        height: 80,
        border: '10px solid #ff0000',
        fontSize: '20px',
        color: 'red',
      }}
    >
      <div>Area!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!</div>
      <div>Fullscreen</div>
    </div>
  );
};

export default CaptureOptionPanel;
