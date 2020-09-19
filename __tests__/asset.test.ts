import { decomposeAsset, formatAsset } from '../src/asset';

const symbol = { code: `EOS`, precision: 4 };

describe(`asset`, () => {
  it(`can format positive asset`, () => {
    let fmt = formatAsset({ amount: 1, symbol });
    expect(fmt).toBe(`0.0001 EOS`);

    fmt = formatAsset({ amount: 1e3 * 1e4, symbol });
    expect(fmt).toBe(`1000.0000 EOS`);

    fmt = formatAsset(
      { amount: 1e3 * 1e4, symbol },
      { withSymbol: false, separateThousands: true },
    );
    expect(fmt).toBe(`1,000.0000`);
  });
  it(`can decompose asset with 0 precision`, () => {
    let assetString = `10 AAAA`;

    const asset = decomposeAsset(assetString);
    expect(asset.amount.toString()).toBe(`10`);
    expect(asset.symbol.code).toBe(`AAAA`);
    expect(asset.symbol.precision).toBe(0);

    let fmt = formatAsset(asset);
    expect(fmt).toBe(`10 AAAA`);
  });

  it(`can format negative asset`, () => {
    let fmt = formatAsset({ amount: -1, symbol });
    expect(fmt).toBe(`-0.0001 EOS`);

    fmt = formatAsset(
      { amount: -1e3 * 1e4, symbol },
      { withSymbol: false, separateThousands: true },
    );
    expect(fmt).toBe(`-1,000.0000`);

    fmt = formatAsset(
      { amount: -1e3 * 1e4, symbol },
      { withSymbol: false, separateThousands: true },
    );
    expect(fmt).toBe(`-1,000.0000`);
  });
});
