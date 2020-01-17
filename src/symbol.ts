import Long from 'long';
import { TextEncoder } from 'util';
import { convertValue2Name } from './name';

const textEncoder = new TextEncoder();

export const convertSymbolCode2Raw = (symbolCode: string) => {
  if (typeof symbolCode !== 'string') {
    throw new Error('Expected string containing symbol_code');
  }
  const a = [];
  a.push(...textEncoder.encode(symbolCode));
  while (a.length < 8) {
    a.push(0);
  }

  const symbolCodeValue = Long.fromBytesLE(a, true);

  return symbolCodeValue;
};

export const convertSymbolCode2Name = (symbolCode: string) => {
  const val = convertSymbolCode2Raw(symbolCode);

  return convertValue2Name(val, true);
};

// console.log(convertSymbolCode2Name(`EOS`));
