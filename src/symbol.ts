import Long from 'long';
import { convertValue2NameSerialized, convertName2ValueSerialized } from './name';
import { textEncoder, textDecoder } from './utils/poly-fill';
import { TAssetSymbol } from './@types';
import { getLong } from './utils/serialize';

export const convertSymbol2Raw = (symbol: TAssetSymbol): Long => {
  if (!symbol || typeof symbol.code !== 'string' || typeof symbol.precision !== `number`) {
    throw new Error('convertSymbol2Raw: Expected TAssetSymbol');
  }
  if (!/^[A-Z]{1,7}$/.test(symbol.code)) {
    throw new Error('Expected symbol to be A-Z and between one and seven characters');
  }
  // eslint-disable-next-line no-bitwise
  const a = [symbol.precision & 0xff];
  a.push(...textEncoder.encode(symbol.code));
  while (a.length < 8) {
    a.push(0);
  }

  const symbolRawValue = Long.fromBytesLE(a, true);

  return symbolRawValue;
};

export const convertRaw2Symbol = (value: Long | number | string): TAssetSymbol => {
  let bytes = getLong(value).toBytesLE();
  let [precision, ...codeBytes] = bytes;
  const stringTerminationIndex = codeBytes.findIndex(b => b === 0);
  if (stringTerminationIndex >= 0) {
    codeBytes = codeBytes.slice(0, stringTerminationIndex);
  }
  const name = textDecoder.decode(new Uint8Array(codeBytes));
  return { code: name, precision };
};

// https://github.com/EOSIO/eosjs/blob/master/src/eosjs-serialize.ts#L386-L420
export const convertSymbolCode2Raw = (symbolCode: string): Long => {
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

export const convertRaw2SymbolCode = (value: Long | number | string): string => {
  let bytes = getLong(value).toBytesLE();
  const stringTerminationIndex = bytes.findIndex(b => b === 0);
  if (stringTerminationIndex >= 0) {
    bytes = bytes.slice(0, stringTerminationIndex);
  }
  const name = textDecoder.decode(new Uint8Array(bytes));
  return name;
};

export const convertSymbolCode2Name = (symbolCode: string) => {
  const val = convertSymbolCode2Raw(symbolCode);

  return convertValue2NameSerialized(val);
};

export const convertName2SymbolCode = (encodedSymbolName: string) => {
  const raw = convertName2ValueSerialized(encodedSymbolName);
  return convertRaw2SymbolCode(raw);
};
