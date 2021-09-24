/* eslint-disable import/prefer-default-export */

export const preventZoomKeyEvent = () => {
  if (!window) {
    return;
  }
  window.onkeydown = (event: KeyboardEvent) => {
    if (
      (event.code === 'Minus' || event.code === 'Equal') &&
      (event.ctrlKey || event.metaKey)
    ) {
      event.preventDefault();
    }
  };
};
