import { DateTime } from 'luxon';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ValidatorFunction } from '@/components/inline/common';
import { InlineLabel } from '@/components/inline/inline-label';
import { Calendar } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useClick } from '@/lib/useClick';
import { cn } from '@/lib/utils';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

export type InlineDatePickerProps = {
  label?: string;
  className?: string;
  initialValue?: Date;
  validator?: ValidatorFunction<Date>;
  required?: boolean;
  onSubmitted: (value: Date) => Promise<void> | void;
};

const checkIfAncestorHasId = (element: HTMLElement | undefined, id: string) => {
  if (!element) {
    return false;
  }

  if (element.id === id) {
    return true;
  }

  if (element.parentElement) {
    return checkIfAncestorHasId(element.parentElement, id);
  }

  return false;
};

export const InlineDatePicker = ({
  label,
  className,
  initialValue,
  validator,
  required,
  onSubmitted,
}: InlineDatePickerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue ?? new Date());
  const [error, setError] = useState<string | undefined>(undefined);
  const uniqueId = useRef(Math.random().toString(36).substring(7));

  const combinedValidator: ValidatorFunction<Date> = (value) => {
    const requiredError = validator ? validator(value) : undefined;
    return requiredError;
  };

  const checkAndSubmit = async (v?: Date) => {
    const val = v ?? value;
    const error = combinedValidator(val);
    setError(error);
    if (!error) {
      if (val !== initialValue) {
        await onSubmitted(val);
      }

      setIsEditing(false);
    }
  };

  const reset = () => {
    setIsEditing(false);
    setValue(initialValue ?? new Date());
    setError(undefined);
  };

  useEffect(() => {
    if (isEditing) {
      setError(combinedValidator(value));
    }
  }, [value, isEditing]);

  useLayoutEffect(() => {
    setValue(initialValue ?? new Date());
  }, [initialValue]);

  const inputRef = useRef<HTMLInputElement>(null);

  useClick((ev: MouseEvent) => {
    if (isEditing) {
      if (!checkIfAncestorHasId(ev.target as HTMLElement, uniqueId.current)) {
        checkAndSubmit();
      }
    }
  });

  return (
    <div
      className="grow"
      onClick={(e) => {
        e.stopPropagation();
        if (!isEditing) {
          setIsEditing(true);
        }

        if (inputRef.current) {
          inputRef.current.focus();
        }
      }}
    >
      {label && <InlineLabel required={required}>{label}</InlineLabel>}
      <div className={label ? 'mt-1' : undefined}>
        {isEditing ? (
          <div id={uniqueId.current} className="relative">
            <div
              role="textbox"
              aria-label={label}
              aria-multiline={false}
              aria-invalid={!!error}
              tabIndex={0}
              className="z-[1] flex gap-2 items-center w-full rounded-md border border-input bg-background px-3 py-1 shadow-sm transition-colors placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-1 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-text"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  inputRef.current?.focus();
                }
              }}
            >
              <input
                id="inline-text-input"
                tabIndex={-1}
                ref={inputRef}
                autoFocus
                className={cn(
                  className,
                  'border-none bg-transparent focus-visible:outline-none grow self-stretch'
                )}
                type="text"
                value={DateTime.fromJSDate(value).toLocaleString(DateTime.DATE_MED)}
                onChange={(e) => setValue(DateTime.fromISO(e.target.value).toJSDate())}
                onBlur={(e) => {
                  if (checkIfAncestorHasId(e.relatedTarget as HTMLElement, uniqueId.current)) {
                    return;
                  }

                  checkAndSubmit();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    checkAndSubmit();
                  }

                  if (e.key === 'Escape') {
                    reset();
                  }
                }}
              />
              {error && (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div className="text-red-600 z-10">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="end">
                    <div className="font-medium">{error}</div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className="absolute bottom-0 left-0 z-1 translate-y-[100%] pt-2">
              <div
                className="bg-background border rounded-md"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Calendar
                  mode="single"
                  selected={value}
                  onSelect={(d) => {
                    checkAndSubmit(d ?? new Date());
                  }}
                  initialFocus
                />
              </div>
            </div>
          </div>
        ) : (
          <div
            tabIndex={0}
            className={cn(
              className,
              'flex gap-2 px-3 py-1 border-transparent border hover:border-border items-center rounded-md focus:bg-background hover:bg-background cursor-pointer transition-colors'
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsEditing(true);
              }
            }}
          >
            {DateTime.fromJSDate(value).toLocaleString(DateTime.DATE_MED)}
          </div>
        )}
      </div>
    </div>
  );
};
