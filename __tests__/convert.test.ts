import Long from 'long';
import {
  convertSymbolCode2Name,
  convertName2SymbolCode,
  convertSymbolCode2Raw,
  convertRaw2SymbolCode,
  convertSymbol2Raw,
  convertRaw2Symbol,
} from '../src/symbol';
import { convertValue2Name, convertValue2NameSerialized } from '../src/name';

describe(`symbol codes`, () => {
  it(`can convert symbol codes`, () => {
    const encodedSymbol = convertSymbolCode2Name(`EOS`);
    expect(encodedSymbol).toBe(`........ehbo5`);
  });

  it(`correctly converts EOS symbol code to raw`, () => {
    const encodedSymbol = convertSymbolCode2Raw(`EOS`);
    const reconvertedSymbol = convertRaw2SymbolCode(encodedSymbol);
    expect(reconvertedSymbol).toBe(`EOS`);
  });

  it(`correctly converts EOS symbol code`, () => {
    const encodedSymbol = convertSymbolCode2Name(`EOS`);
    const reconvertedSymbol = convertName2SymbolCode(encodedSymbol);
    expect(reconvertedSymbol).toBe(`EOS`);
  });

  it(`correctly converts encoded names to symbol raw number`, () => {
    const encodedSymbol = `...........q4`;
    const reconvertedSymbol = convertName2SymbolCode(encodedSymbol);
    const raw = convertSymbolCode2Raw(reconvertedSymbol).toString(10);
    expect(raw).toBe(`356`);
  });
});

describe(`symbol`, () => {
  const EOS_SYMBOL = { code: `EOS`, precision: 4 };
  it(`can convert symbols`, () => {
    const encodedSymbol = convertSymbol2Raw(EOS_SYMBOL);
    expect(encodedSymbol.toString()).toBe(`1397703940`);
    const decodedSymbol = convertRaw2Symbol(encodedSymbol);
    expect(decodedSymbol.code).toBe(`EOS`);
    expect(decodedSymbol.precision).toBe(4);
  });
});

describe(`names`, () => {
  it(`can convert names`, () => {
    const encodedName = convertValue2NameSerialized(Long.fromString(`6138663577826885632`));
    expect(encodedName).toBe(`eosio`);
  });

  it(`can convert names 2`, () => {
    const encodedName = convertValue2NameSerialized(Long.fromString(`-6569208335818555392`));
    expect(encodedName).toBe(`onerror`);
  });

  it(`can convert names 3`, () => {
    const encodedName = convertValue2NameSerialized(Long.fromString(`-3617168760277827584`));
    expect(encodedName).toBe(`transfer`);
  });
});
