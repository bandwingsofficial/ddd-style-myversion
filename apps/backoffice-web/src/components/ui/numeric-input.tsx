'use client';

import {
  forwardRef,
  useLayoutEffect,
  useRef,
  type InputHTMLAttributes,
} from 'react';

import { cn } from '@/lib/utils';

export function normalizeNumericInputValue(
  nextValue: string,
  previousValue: string,
): string {
  if (nextValue === '') {
    return '';
  }

  if (!/^\d*\.?\d*$/.test(nextValue)) {
    return previousValue;
  }

  if (
    previousValue === '0' &&
    nextValue.length === 2 &&
    nextValue.startsWith('0') &&
    nextValue[1] !== '.'
  ) {
    return nextValue.slice(1);
  }

  if (/^0[0-9]+/.test(nextValue)) {
    return nextValue.replace(/^0+/, '') || '0';
  }

  return nextValue;
}

export function parseNumericInputValue(value: string): number | null {
  if (value === '' || value === '.') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

interface NumericInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: string;
  onChange: (value: string) => void;
}

export const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
  function NumericInput(
    { value, onChange, className, ...props },
    ref,
  ) {
    const innerRef = useRef<HTMLInputElement | null>(null);
    const cursorRef = useRef<number | null>(null);

    const setRefs = (node: HTMLInputElement | null) => {
      innerRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    useLayoutEffect(() => {
      if (innerRef.current && cursorRef.current !== null) {
        innerRef.current.setSelectionRange(
          cursorRef.current,
          cursorRef.current,
        );
        cursorRef.current = null;
      }
    }, [value]);

    return (
      <input
        {...props}
        ref={setRefs}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(event) => {
          const nextValue = normalizeNumericInputValue(
            event.target.value,
            value,
          );
          cursorRef.current = event.target.selectionStart;
          onChange(nextValue);
        }}
        className={cn(className)}
      />
    );
  },
);
