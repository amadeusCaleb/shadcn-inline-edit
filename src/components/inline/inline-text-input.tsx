import { cva } from 'class-variance-authority';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { textRequiredValidator, ValidatorFunction } from '@/components/inline/common';
import { InlineLabel } from '@/components/inline/inline-label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

export type Variant = 'text' | 'text-bg-card' | 'badge';

export type InlineTextInputProps = {
  label?: string;
  className?: string;
  initialValue?: string | null;
  placeholder?: string;
  validator?: ValidatorFunction<string>;
  required?: boolean;
  onSubmitted: (value: string) => Promise<void> | void;
  variant?: Variant;
};

const textInputVariants = cva(
  'z-[1] flex items-center w-full rounded-md border focus-within:outline-none focus-within:ring-1 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-text',
  {
    variants: {
      variant: {
        text: 'px-3 py-1 shadow-sm transition-colors placeholder:text-muted-foreground border-input bg-background',
        'text-bg-card':
          'px-3 py-1 shadow-sm transition-colors placeholder:text-muted-foreground border-input bg-card',
        badge: 'px-2.5 py-0.5 text-xs font-semibold transition-colors mb-[0.5px] bg-background',
      },
    },
    defaultVariants: {
      variant: 'text',
    },
  }
);

const textInputDisplayVariants = cva('items-center rounded-md cursor-pointer transition-colors', {
  variants: {
    variant: {
      text: 'flex px-3 py-1 border-transparent border hover:border-border focus:bg-background hover:bg-background',
      'text-bg-card':
        'flex px-3 py-1 border-transparent border hover:border-border focus:bg-card hover:bg-card',
      badge:
        'inline-flex border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80',
    },
  },
  defaultVariants: {
    variant: 'text',
  },
});

export const InlineTextInput = ({
  label,
  className,
  initialValue,
  placeholder,
  validator,
  required,
  onSubmitted,
  variant,
}: InlineTextInputProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue ?? '');
  const [error, setError] = useState<string | undefined>(undefined);

  const combinedValidator: ValidatorFunction<string> = (value) => {
    const requiredError = validator ? validator(value) : undefined;
    const emptyError = required ? textRequiredValidator(value) : undefined;
    return requiredError ?? emptyError;
  };

  const checkAndSubmit = async () => {
    const error = combinedValidator(value);
    setError(error);
    if (!error) {
      if (value !== initialValue) {
        await onSubmitted(value ?? '');
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
      className="grow flex-1"
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
          <div className="relative">
            <div
              role="textbox"
              aria-label={label}
              aria-multiline={false}
              aria-invalid={!!error}
              tabIndex={0}
              className={cn(textInputVariants({ variant }), className)}
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
                value={value}
                placeholder={placeholder}
                onChange={(e) => setValue(e.target.value)}
                onBlur={(e) => {
                  if (
                    e.relatedTarget &&
                    (e.relatedTarget.id === 'inline-text-input-check-button' ||
                      e.relatedTarget.id === 'inline-text-input-x-button')
                  ) {
                    return;
                  }

                  checkAndSubmit();
                }}
                onKeyDown={(e) => {
                  e.stopPropagation();

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
          </div>
        ) : (
          <div
            id="inline-text-input"
            role="textbox"
            tabIndex={0}
            className={cn(className, textInputDisplayVariants({ variant }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsEditing(true);
              }
            }}
          >
            {value && <span>{value}</span>}
            {!value && (
              <span className="text-muted-foreground italic ">
                {placeholder ?? 'Click to edit'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};