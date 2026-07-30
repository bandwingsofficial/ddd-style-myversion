'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { cn } from '@/lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  searchable?: boolean;
  leadingIcon?: React.ReactNode;
  className?: string;
  onBlur?: () => void;
  'aria-label'?: string;
}

export const DropdownSelect = forwardRef<HTMLButtonElement, DropdownSelectProps>(
  function DropdownSelect(
    {
      id,
      value,
      onChange,
      options,
      placeholder = 'Select…',
      disabled = false,
      hasError = false,
      searchable = false,
      leadingIcon,
      className,
      onBlur,
      'aria-label': ariaLabel,
    },
    ref,
  ) {
    const listboxId = useId();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [position, setPosition] = useState({
      top: 0,
      left: 0,
      width: 0,
      maxHeight: 240,
    });

    useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement);

    const filteredOptions = searchable
      ? options.filter((option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : options;

    const selectedOption = options.find((option) => option.value === value);

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

    const close = useCallback(
      (options?: { invokeBlur?: boolean }) => {
        setOpen(false);
        setSearchQuery('');
        if (options?.invokeBlur !== false) {
          onBlur?.();
        }
      },
      [onBlur],
    );

    const selectOption = useCallback(
      (option: DropdownOption) => {
        onChange(option.value);
        close({ invokeBlur: false });
      },
      [close, onChange],
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

      const selectedIndex = filteredOptions.findIndex(
        (option) => option.value === value,
      );
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);

      if (searchable) {
        window.setTimeout(() => searchRef.current?.focus(), 0);
      }
    }, [open, searchable, filteredOptions, value]);

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
          event.key === 'ArrowDown' ||
          event.key === 'ArrowUp'
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
            current < filteredOptions.length - 1 ? current + 1 : 0,
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex((current) =>
            current > 0 ? current - 1 : filteredOptions.length - 1,
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (filteredOptions[highlightedIndex]) {
            selectOption(filteredOptions[highlightedIndex]);
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
                {searchable && (
                  <div className="border-b border-border p-2">
                    <div className="relative">
                      <Search
                        size={14}
                        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <input
                        ref={searchRef}
                        value={searchQuery}
                        onChange={(event) => {
                          setSearchQuery(event.target.value);
                          setHighlightedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Search…"
                        className="h-9 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                  </div>
                )}
                <div
                  className="overflow-y-auto p-1.5"
                  style={{ maxHeight: position.maxHeight - (searchable ? 52 : 0) }}
                >
                  {filteredOptions.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      No results found
                    </p>
                  ) : (
                    filteredOptions.map((option, index) => {
                      const isSelected = option.value === value;
                      const isHighlighted = index === highlightedIndex;

                      return (
                        <button
                          key={option.value || '__empty__'}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          onClick={() => selectOption(option)}
                          className={cn(
                            'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                            isHighlighted && 'bg-muted',
                            isSelected && 'bg-primary/10 text-primary',
                            !isSelected && !isHighlighted && 'text-foreground hover:bg-muted/70',
                          )}
                        >
                          <span className="truncate">{option.label}</span>
                          {isSelected && (
                            <Check size={16} className="shrink-0 text-primary" />
                          )}
                        </button>
                      );
                    })
                  )}
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
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => {
            if (!disabled) {
              setOpen((current) => !current);
            }
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            'relative flex h-12 w-full items-center gap-2 rounded-xl border bg-background px-4 text-sm font-medium transition-colors',
            leadingIcon && 'pl-10',
            hasError
              ? 'border-destructive focus-visible:border-destructive focus-visible:ring-4 focus-visible:ring-destructive/10'
              : 'border-input focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10',
            disabled && 'cursor-not-allowed opacity-50',
            !disabled && 'hover:border-primary/40',
            'focus-visible:outline-none',
            className,
          )}
        >
          {leadingIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
              {leadingIcon}
            </span>
          )}
          <span
            className={cn(
              'flex-1 truncate text-left',
              !selectedOption && 'text-muted-foreground',
            )}
          >
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronDown
            size={16}
            className={cn(
              'shrink-0 text-muted-foreground transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </button>
        {menu}
      </>
    );
  },
);
