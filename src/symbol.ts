import Long from 'long';
import { encode, decode } from 'isomorphic-textencoder';
import { convertValue2NameSerialized, convertName2ValueSerialized } from './name';

// https://github.com/EOSIO/eosjs/blob/master/src/eosjs-serialize.ts#L386-L420
export const convertSymbolCode2Raw = (symbolCode: string): Long => {
  if (typeof symbolCode !== 'string') {
    throw new Error('Expected string containing symbol_code');
  }
  const a = [];
  a.push(...encode(symbolCode));
  while (a.length < 8) {
    a.push(0);
  }

  const symbolCodeValue = Long.fromBytesLE(a, true);

  return symbolCodeValue;
};

export const convertRaw2SymbolCode = (value: Long): string => {
  let bytes = value.toBytesLE();
  const stringTerminationIndex = bytes.findIndex(b => b === 0);
  if (stringTerminationIndex >= 0) {
    bytes = bytes.slice(0, stringTerminationIndex);
  }
  const name = decode(new Uint8Array(bytes));
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
