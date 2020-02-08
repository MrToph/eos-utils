import {
  convertSymbolCode2Name,
  convertName2SymbolCode,
  convertSymbolCode2Raw,
  convertRaw2SymbolCode,
} from '../src/symbol';
import { convertValue2Name } from '../src/name';

describe(`convert`, () => {
  it(`can convert symbols`, () => {
    const encodedSymbol = convertSymbolCode2Name(`EOS`);
    expect(encodedSymbol).toBe(`........ehbo5`);
  });

  it(`correctly converts EOS symbol to raw`, () => {
    const encodedSymbol = convertSymbolCode2Raw(`EOS`);
    const reconvertedSymbol = convertRaw2SymbolCode(encodedSymbol);
    expect(reconvertedSymbol).toBe(`EOS`);
  });

  it(`correctly converts EOS symbol`, () => {
    const encodedSymbol = convertSymbolCode2Name(`EOS`);
    const reconvertedSymbol = convertName2SymbolCode(encodedSymbol);
    expect(reconvertedSymbol).toBe(`EOS`);
  });

  it(`correctly converts to contract raw number`, () => {
    const encodedSymbol = `...........q4`;
    const reconvertedSymbol = convertName2SymbolCode(encodedSymbol);
    const raw = convertSymbolCode2Raw(reconvertedSymbol).toString(10);
    expect(raw).toBe(`356`);
  });
});