import Long from 'long';

export function getLong(value: Long | number | string) {
  if (typeof value === `string`) return Long.fromString(value);
  if (typeof value === `number`) return Long.fromNumber(value);
  return value;
}
