import { Check } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ValidatorFunction } from '@/components/inline/common';
import { InlineLabel } from '@/components/inline/inline-label';
import { Badge } from '@/components/ui/badge';
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

export type InlineMultiSelectComboboxProps = {
  label?: string;
  className?: string;
  initialValue?: string[] | null;
  placeholder?: string;
  searchPlaceholder?: string;
  options: {
    key: string;
    label: string;
  }[];
  empty?: string;
  validator?: ValidatorFunction<string[]>;
  required?: boolean;
  onSubmitted: (value: string[]) => Promise<void> | void;
};

export const InlineMultiSelectCombobox = ({
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
}: InlineMultiSelectComboboxProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue ?? []);
  const [error, setError] = useState<string | undefined>(undefined);

  const combinedValidator: ValidatorFunction<string[]> = (value) => {
    const requiredError = validator ? validator(value) : undefined;
    return requiredError;
  };

  const checkAndSubmit = async (val?: string[]) => {
    const v = val || value;
    const error = combinedValidator(v);
    setError(error);
    if (!error) {
      if (v !== initialValue) {
        await onSubmitted(v ?? []);
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
    setValue(initialValue ?? []);
  }, [initialValue]);

  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOptions = options.filter((option) => value.includes(option.key));

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
                  <div
                    className="flex items-center grow gap-2"
                    role="combobox"
                    aria-expanded={true}
                  >
                    {value
                      ? selectedOptions.map((x) => <Badge variant="secondary">{x.label}</Badge>)
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
                              if (value.includes(currentValue)) {
                                setValue(value.filter((v) => v !== currentValue));
                              } else {
                                setValue([...value, currentValue]);
                              }
                            }}
                            keywords={[option.label]}
                          >
                            {selectedOptions.includes(option) ? (
                              <Check className={'mr-2 h-4 w-4'} />
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
            {selectedOptions && selectedOptions.length > 0 && (
              <div className="flex gap-2">
                {selectedOptions.map((x) => (
                  <Badge key={x.key} variant="secondary">
                    {x.label}
                  </Badge>
                ))}
              </div>
            )}
            {(!selectedOptions || selectedOptions.length === 0) && (
              <span className="text-muted-foreground italic">{placeholder ?? 'Click to edit'}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
