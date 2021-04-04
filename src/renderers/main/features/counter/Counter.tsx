import React from 'react';
import { TypedUseSelectorHook, useSelector, useDispatch } from 'react-redux';

import type { RootState, AppDispatch } from '../../store';

import { increment, decrement } from './counterSlice';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useAppDispatch = () => useDispatch<AppDispatch>();
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// eslint-disable-next-line import/prefer-default-export
export const Counter = () => {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <div>
        <button
          type="button"
          aria-label="Increment value"
          onClick={() => dispatch(increment())}
        >
          Increment
        </button>
        <span>{count}</span>
        <button
          type="button"
          aria-label="Decrement value"
          onClick={() => dispatch(decrement())}
        >
          Decrement
        </button>
      </div>
    </div>
  );
};
