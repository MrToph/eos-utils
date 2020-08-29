/**
 * @jest-environment node
 */
// test-env node to avoid strange localhost cors error: https://github.com/axios/axios/issues/1754#issuecomment-435784235
import { createSigningRequest } from '../src/signing-request';
import { createNetworkRandomEndpoint } from '../src/network';

const TIMEOUT = 15000;
jest.setTimeout(2 * TIMEOUT);

describe(`createSigningRequest`, () => {
  it(`creates a signing request`, async () => {
    expect.assertions(1);

    const network = createNetworkRandomEndpoint(`eos`);

    const action = {
      account: `eosio.token`,
      name: `transfer`,
      authorization: [{ actor: `dummy.test`, permission: `active` }],
      data: {
        from: `dummy.test`,
        to: `dummy2.test`,
        quantity: `1.0000 EOS`,
        memo: ``,
      },
    };

    const eosioUri = await createSigningRequest([action], network.rpc);
    await expect(eosioUri.toString()).toMatch(/^esr:\/\//i);
  });
});
