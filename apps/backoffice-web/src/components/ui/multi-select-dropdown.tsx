'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Tag, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  id?: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function formatTagLabel(value: string) {
  return value.replace(/_/g, ' ');
}

export function MultiSelectDropdown({
  id,
  values,
  onChange,
  options,
  placeholder = 'Select…',
  disabled = false,
  className,
}: MultiSelectDropdownProps) {
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 240,
  });

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const maxMenuHeight = 240;
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
    const availableHeight = openUp ? spaceAbove : spaceBelow;
    const maxHeight = Math.min(maxMenuHeight, Math.max(availableHeight, 120));

    setPosition({
      top: openUp ? rect.top - maxHeight - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      maxHeight,
    });
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const toggleValue = useCallback(
    (value: string) => {
      onChange(
        values.includes(value)
          ? values.filter((item) => item !== value)
          : [...values, value],
      );
    },
    [onChange, values],
  );

  const removeValue = useCallback(
    (value: string, event: React.MouseEvent) => {
      event.stopPropagation();
      onChange(values.filter((item) => item !== value));
    },
    [onChange, values],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    updatePosition();
    const handleScrollOrResize = () => updatePosition();
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        document.getElementById(listboxId)?.contains(target)
      ) {
        return;
      }
      close();
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [close, listboxId, open]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) {
      return;
    }

    if (!open) {
      if (
        event.key === 'Enter' ||
        event.key === ' ' ||
        event.key === 'ArrowDown'
      ) {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        close();
        triggerRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex((current) =>
          current < options.length - 1 ? current + 1 : 0,
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex((current) =>
          current > 0 ? current - 1 : options.length - 1,
        );
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (options[highlightedIndex]) {
          toggleValue(options[highlightedIndex].value);
        }
        break;
      case 'Tab':
        close();
        break;
      default:
        break;
    }
  };

  const menu =
    open && typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            <motion.div
              id={listboxId}
              role="listbox"
              aria-multiselectable="true"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'fixed',
                top: position.top,
                left: position.left,
                width: position.width,
                maxHeight: position.maxHeight,
                zIndex: 9999,
              }}
              className="overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
            >
              <div
                className="overflow-y-auto p-1.5"
                style={{ maxHeight: position.maxHeight }}
              >
                {options.map((option, index) => {
                  const isSelected = values.includes(option.value);
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => toggleValue(option.value)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                        isHighlighted && 'bg-muted',
                        isSelected && 'bg-primary/10 text-primary',
                        !isSelected && !isHighlighted && 'text-foreground hover:bg-muted/70',
                      )}
                    >
                      <span>{option.label}</span>
                      {isSelected && (
                        <Check size={16} className="shrink-0 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (!disabled) {
            setOpen((current) => !current);
          }
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex min-h-12 w-full items-start gap-2 rounded-xl border border-input bg-background px-3 py-2.5 text-sm transition-colors',
          'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10',
          disabled && 'cursor-not-allowed opacity-50',
          !disabled && 'hover:border-primary/40',
          className,
        )}
      >
        <Tag size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {values.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            values.map((value) => (
              <span
                key={value}
                className="inline-flex max-w-full items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-foreground"
              >
                <span className="truncate">{formatTagLabel(value)}</span>
                {!disabled && (
                  <span
                    role="button"
                    tabIndex={-1}
                    aria-label={`Remove ${formatTagLabel(value)}`}
                    onClick={(event) => removeValue(value, event)}
                    className="rounded-sm text-muted-foreground hover:bg-background hover:text-foreground"
                  >
                    <X size={12} />
                  </span>
                )}
              </span>
            ))
          )}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            'ml-auto mt-0.5 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      {menu}
    </>
  );
}
