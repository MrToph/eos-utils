/**
 * @jest-environment node
 */
// test-env node to avoid strange localhost cors error: https://github.com/axios/axios/issues/1754#issuecomment-435784235
import { getApiEndpoints } from '../src/endpoints';

const TIMEOUT = 15000
jest.setTimeout(2 * TIMEOUT);

describe(`endpoints`, () => {
  it(`fetches them sorted by latency`, async () => {
    expect.assertions(1);
    const endpoints = await getApiEndpoints(`mainnet`, { timeoutMs: TIMEOUT });
    console.log(endpoints);
    expect(endpoints[0].latency).toBeLessThan(endpoints[1].latency);
  });
});
