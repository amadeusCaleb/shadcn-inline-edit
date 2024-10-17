import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { colourValidator, ValidatorFunction } from '@/components/inline/common';
import { InlineLabel } from '@/components/inline/inline-label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

export type InlineColourInputProps = {
  label?: string;
  className?: string;
  initialValue?: string;
  placeholder?: string;
  validator?: ValidatorFunction<string>;
  required?: boolean;
  onSubmitted: (value: string) => Promise<void> | void;
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

export const InlineColourInput = ({
  label,
  className,
  initialValue,
  placeholder,
  validator,
  required,
  onSubmitted,
}: InlineColourInputProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue ?? '');
  const [error, setError] = useState<string | undefined>(undefined);
  const uniqueId = useRef(Math.random().toString(36).substring(7));

  const combinedValidator: ValidatorFunction<string> = (value) => {
    const requiredError = validator ? validator(value) : undefined;
    const colourCheck = required ? colourValidator(value) : undefined;
    return requiredError ?? colourCheck;
  };

  const checkAndSubmit = async () => {
    const error = combinedValidator(value);
    setError(error);
    if (!error) {
      if (value !== initialValue) {
        await onSubmitted(value);
      }

      setIsEditing(false);
    }
  };

  const reset = () => {
    setIsEditing(false);
    setValue(initialValue ?? '');
    setError(undefined);
  };

  useEffect(() => {
    if (isEditing) {
      setError(combinedValidator(value));
    }
  }, [value, isEditing]);

  useLayoutEffect(() => {
    setValue(initialValue ?? '');
  }, [initialValue]);

  const inputRef = useRef<HTMLInputElement>(null);

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
              <div
                className="h-6 w-6 border rounded-full"
                style={{
                  background: value,
                }}
              />
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
                value={value}
                placeholder={placeholder}
                onChange={(e) => setValue(e.target.value)}
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
            <div className="absolute bottom-0 left-0 z-10 translate-y-[100%] pt-2">
              <HexColorPicker
                id="inline-colour-picker"
                color={value}
                onChange={(value) => setValue(value)}
                onBlur={(e) => {
                  if (checkIfAncestorHasId(e.relatedTarget as HTMLElement, uniqueId.current)) {
                    return;
                  }

                  checkAndSubmit();
                }}
              />
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
            <div className="h-6 w-6 border rounded-full" style={{ background: initialValue }} />
            {value}
          </div>
        )}
      </div>
    </div>
  );
};
