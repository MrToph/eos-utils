import { createNetwork } from '../src/network';

describe(`networks`, () => {
  const TEST_CASES = [
    `http://mainnet.eoscanada.com`,
    `https://api.eoseoul.io`,
    `http://api.eosrapid.com:8888`,
  ];
  const TEST_CASES_EXPECTATIONS = [
    {
      protocol: `http`,
      host: `mainnet.eoscanada.com`,
      port: 80,
    },
    {
      protocol: `https`,
      host: `api.eoseoul.io`,
      port: 443,
    },
    {
      protocol: `http`,
      host: `api.eosrapid.com`,
      port: 8888,
    },
  ];

  it(`can parse all networks`, () => {
    expect.assertions(TEST_CASES.length);

    TEST_CASES.forEach((endpoint, index) => {
      const network = createNetwork(`eos`, endpoint);

      expect(network).toMatchObject(TEST_CASES_EXPECTATIONS[index]);
    });
  });
});
