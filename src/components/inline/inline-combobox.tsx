import { Check } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { textRequiredValidator, ValidatorFunction } from '@/components/inline/common';
import { InlineLabel } from '@/components/inline/inline-label';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

export type InlineComboboxProps = {
  label?: string;
  className?: string;
  initialValue?: string | null;
  placeholder?: string;
  searchPlaceholder?: string;
  options: {
    key: string;
    label: string;
  }[];
  empty?: string;
  validator?: ValidatorFunction<string>;
  required?: boolean;
  onSubmitted: (value: string) => Promise<void> | void;
};

export const InlineCombobox = ({
  label,
  className,
  initialValue,
  placeholder,
  validator,
  required,
  onSubmitted,
  options,
  empty,
  searchPlaceholder,
}: InlineComboboxProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue ?? '');
  const [error, setError] = useState<string | undefined>(undefined);

  const combinedValidator: ValidatorFunction<string> = (value) => {
    const requiredError = validator ? validator(value) : undefined;
    const emptyError = required ? textRequiredValidator(value) : undefined;
    return requiredError ?? emptyError;
  };

  const checkAndSubmit = async (val?: string) => {
    const v = val || value;
    const error = combinedValidator(v);
    setError(error);
    if (!error) {
      if (v !== initialValue) {
        await onSubmitted(v ?? '');
      }

      setIsEditing(false);
    }
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

  const selectedOption = options.find((option) => option.key === value);

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
          <div className="relative">
            <div
              role="textbox"
              aria-label={label}
              aria-multiline={false}
              aria-invalid={!!error}
              tabIndex={0}
              className="z-[1] flex items-center w-full rounded-md border border-input bg-background px-3 py-1 shadow-sm transition-colors placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-1 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-text"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  inputRef.current?.focus();
                }
              }}
            >
              <Popover
                open={true}
                onOpenChange={(open) => {
                  if (!open) {
                    checkAndSubmit();
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <div className="flex items-center grow" role="combobox" aria-expanded={true}>
                    {value
                      ? options.find((option) => option.key === value)?.label
                      : placeholder ?? 'Select...'}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0 ml-[-1rem] mt-2" align="start">
                  <Command>
                    <CommandInput placeholder={searchPlaceholder ?? 'Search...'} />
                    <CommandList>
                      <CommandEmpty>{empty ?? 'None found...'}</CommandEmpty>
                      <CommandGroup>
                        {options.map((option) => (
                          <CommandItem
                            key={option.key}
                            value={option.key}
                            onSelect={(currentValue) => {
                              checkAndSubmit(currentValue === value ? '' : currentValue);
                            }}
                            keywords={[option.label]}
                          >
                            {value === option.key ? (
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  value === option.key ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                            ) : (
                              <div className="mr-2 h-4 w-4" />
                            )}
                            {option.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
            tabIndex={0}
            className={cn(
              className,
              'flex px-3 py-1 border-transparent border hover:border-border items-center rounded-md focus:bg-background hover:bg-background cursor-pointer transition-colors'
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsEditing(true);
              }
            }}
          >
            {selectedOption && <span>{selectedOption.label}</span>}
            {!selectedOption && (
              <span className="text-muted-foreground italic">{placeholder ?? 'Click to edit'}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
