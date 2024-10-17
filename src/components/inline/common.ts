/**
 * Validator function type
 * @param value - value to validate
 * @returns error message if value is invalid, undefined otherwise
 */
export type ValidatorFunction<T> = (value: T) => string | undefined;

export const textRequiredValidator: ValidatorFunction<string> = (value) =>
  value.trim() === '' ? 'Please enter a value' : undefined;

export const colourValidator: ValidatorFunction<string> = (value) =>
  /^#[0-9A-F]{6}$/i.test(value) ? undefined : 'Please enter a valid colour';
