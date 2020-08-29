// Originally from https://raw.githubusercontent.com/EOSIO/eosjs/v16.0.9/src/format.js
// eosjs2 does not have this function
import Long from 'long';

function getLong(value: Long | number | string) {
  if (typeof value === `string`) return Long.fromString(value);
  if (typeof value === `number`) return Long.fromNumber(value);
  return value;
}

function isName(str: string) {
  try {
    convertName2Value(str);
    return true;
  } catch (error) {
    return false;
  }
}

const charmap = '.12345abcdefghijklmnopqrstuvwxyz';
const charidx = (ch: string) => {
  const idx = charmap.indexOf(ch);
  if (idx === -1) throw new TypeError(`Invalid character: '${ch}'`);

  return idx;
};

function nameToValue(name: string) {
  if (typeof name !== 'string') throw new TypeError('name parameter is a required string');

  if (name.length > 13) throw new TypeError('A name can only be up to 13 characters long');

  let bitstr = '';
  for (let i = 0; i < 13; i += 1) {
    // process all 64 bits (even if name is short)
    const c = i < name.length ? charidx(name[i]) : 0;
    const bitlen = i < 12 ? 5 : 4;
    let bits = Number(c).toString(2);
    if (bits.length > bitlen) {
      throw new TypeError(`Invalid name ${name}`);
    }
    bits = '0'.repeat(bitlen - bits.length) + bits;
    bitstr += bits;
  }

  return Long.fromString(bitstr, true, 2);
}

// return any unnecessary dots at the END of the name
const trimName = (_name: string) => {
  let s = _name;
  while (s.endsWith(`.`)) {
    s = s.slice(0, -1);
  }
  return s;
};

function convertValueToName(value: Long) {
  const charMap = charmap.split(``);
  let bits = value.toString(2);
  bits += '0'.repeat(64 - bits.length);
  const bitsArr = bits.split(``);
  let name = '';
  while (bitsArr.length > 0) {
    // alphabet has 32 = 2^5 chars, except 13th character has 4 bits
    const charBits = bitsArr.splice(0, 5);
    const charVal = Long.fromBits(Number.parseInt(charBits.join(``), 2), 0);
    name += charMap[charVal.toNumber()];
  }

  return trimName(name);
}

/**
 * Encodes a value the same way eosjs (de-)serializes names
 * eosjs name (de-)serialization of names is different from the one that EOSIO uses
 * https://github.com/EOSIO/eosjs/blob/849c03992e6ce3cb4b6a11bf18ab17b62136e5c9/src/eosjs-serialize.ts#L340-L363
 */
function convertValue2NameSerialized(value: Long | number | string): string {
  const val = getLong(value);
  const a = val.toBytesLE();
  let result = '';
  for (let bit = 63; bit >= 0; ) {
    let c = 0;
    for (let i = 0; i < 5; i += 1) {
      if (bit >= 0) {
        // eslint-disable-next-line no-bitwise
        c = (c << 1) | ((a[Math.floor(bit / 8)] >> bit % 8) & 1);
        bit -= 1;
      }
    }
    if (c >= 6) {
      result += String.fromCharCode(c + 'a'.charCodeAt(0) - 6);
    } else if (c >= 1) {
      result += String.fromCharCode(c + '1'.charCodeAt(0) - 1);
    } else {
      result += '.';
    }
  }
  while (result.endsWith('.')) {
    result = result.substr(0, result.length - 1);
  }

  return result;
}

/**
 * Encodes a value the same way eosjs (de-)serializes names
 * eosjs name (de-)serialization of names is different from the one that EOSIO uses
 * https://github.com/EOSIO/eosjs/blob/849c03992e6ce3cb4b6a11bf18ab17b62136e5c9/src/eosjs-serialize.ts#L340-L363
 */
function convertName2ValueSerialized(name: string) {
  if (typeof name !== 'string') {
    throw new Error('Expected string containing name');
  }
  function charToSymbol(c: number) {
    if (c >= 'a'.charCodeAt(0) && c <= 'z'.charCodeAt(0)) {
      return c - 'a'.charCodeAt(0) + 6;
    }
    if (c >= '1'.charCodeAt(0) && c <= '5'.charCodeAt(0)) {
      return c - '1'.charCodeAt(0) + 1;
    }
    return 0;
  }
  const a = new Uint8Array(8);
  let bit = 63;
  for (let i = 0; i < name.length; i += 1) {
    let c = charToSymbol(name.charCodeAt(i));
    if (bit < 5) {
      // eslint-disable-next-line no-bitwise
      c <<= 1;
    }
    for (let j = 4; j >= 0; j -= 1) {
      if (bit >= 0) {
        // eslint-disable-next-line no-bitwise
        a[Math.floor(bit / 8)] |= ((c >> j) & 1) << bit % 8;
        bit -= 1;
      }
    }
  }
  return Long.fromBytesLE(Array.from(a));
}

function bytesToHex(bytes: any) {
  let leHex = '';
  for (const b of bytes) {
    const n = Number(b).toString(16);
    leHex += (n.length === 1 ? '0' : '') + n;
  }
  return leHex;
}

/** Original Name encode and decode logic is in github.com/eosio/eos  native.hpp */

/**
  Encode a name (a base32 string) to a number.
  For performance reasons, the blockchain uses the numerical encoding of strings
  for very common types like account names.
  @see types.hpp string_to_name
  @arg {string} name - A string to encode, up to 12 characters long.
  @arg {string} [littleEndian = true] - Little or Bigendian encoding
  @return {string<uint64>} - compressed string (from name arg).  A string is
    always used because a number could exceed JavaScript's 52 bit limit.
*/
function encodeNameToUint64(name: string, littleEndian: boolean) {
  const value = nameToValue(name);

  // convert to LITTLE_ENDIAN
  const bytes = littleEndian ? value.toBytesLE() : value.toBytesBE();
  let leHex = bytesToHex(bytes);

  const ulName = Long.fromString(leHex, true, 16);
  return ulName;
}

function convertName2Value(name: string, littleEndian = false): Long {
  return encodeNameToUint64(name, littleEndian).toUnsigned();
}

function convertValue2Name(value: Long | number | string): string {
  const val = getLong(value);

  return convertValueToName(val);
}

function getTableBoundsForNameAsValue(name: string) {
  const nameValue = nameToValue(name);
  const nameValueP1 = nameValue.add(1);

  return {
    lower_bound: nameValue.toString(),
    upper_bound: nameValueP1.toString(),
  };
}

function getTableBoundsForName(name: string) {
  const nameValue = nameToValue(name);
  const nameValueP1 = nameValue.add(1);

  const lowerBound = bytesToHex(nameValue.toBytesLE());
  const upperBound = bytesToHex(nameValueP1.toBytesLE());
  return {
    lower_bound: lowerBound as string,
    upper_bound: upperBound as string,
  };
}

export {
  isName,
  convertName2Value,
  convertValue2Name,
  convertName2ValueSerialized,
  convertValue2NameSerialized,
  getTableBoundsForName,
  getTableBoundsForNameAsValue,
};
