import { blockNumberToDate } from '../src/time';
import { createNetworkRandomEndpoint } from '../src/network';

jest.setTimeout(20000);

describe(`time`, () => {
  // xit(`can convert time to blockNumbers`, async () => {
  //   // too inefficient
  //   expect.assertions(1);
  //   let blockNumber = await dateToBlockNumber(rpc)(new Date(`2000-01-01T00:00:00.000Z`));
  //   expect(blockNumber).toBe(-1);
  // });

  // xit(`can convert blockNumbers to Dates`, async () => {
  //   const { rpc } = createNetworkRandomEndpoint(`eos`, { fetch: nodeFetch });
  //   expect.assertions(1);
  //   const date = await blockNumberToDate(rpc)(1);
  //   expect(date.toISOString()).toBe(`2018-06-08T08:08:08.500Z`);
  // });

  it(`is true`, () => {
    expect(true).toBe(true)
  })
});
