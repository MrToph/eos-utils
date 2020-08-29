import { createDfuseClient, OnDiskApiTokenStore } from '@dfuse/client';
import fetch from 'isomorphic-fetch';
import { DfuseSearcher } from '../src/dfuse';

if (!process.env.DFUSE_API_KEY) {
  throw new Error(`No 'DFUSE_API_KEY' env var`);
}

const client = createDfuseClient({
  apiKey: process.env.DFUSE_API_KEY,
  network: `mainnet`,
  httpClientOptions: {
    fetch,
  },
  streamClientOptions: {
    socketOptions: {
      webSocketFactory: (async () => null) as any,
    },
  } as any,
  graphqlStreamClientOptions: {
    socketOptions: {
      webSocketFactory: (async () => null) as any,
    },
  },
  apiTokenStore: new OnDiskApiTokenStore(process.env.DFUSE_API_KEY),
});

const TIMEOUT = 15000;
jest.setTimeout(2 * TIMEOUT);

describe(`dfuse searcher`, () => {
  it(`fetches transfers of b1`, async () => {
    expect.assertions(1);

    const searcher = new DfuseSearcher({ client });

    const actionTraceMatcher = (trace: any) => {
      if (trace.receipt.receiver !== `b1`) return false;

      return (
        trace.act.account === `eosio.token` &&
        trace.act.name === `transfer` &&
        (trace.act.data.from === `b1` || trace.act.data.to === `b1`)
      );
    };

    const searchString = `receiver:b1 account:eosio.token action:transfer`;
    const actions = [];
    for await (const traces of searcher.searchTransactions(searchString, actionTraceMatcher, {
      limit: 1,
    })) {
      expect(traces[0].data.to).toBe(`b1`);
      break;
    }
  });
});
