import { createDfuseClient, OnDiskApiTokenStore } from '@dfuse/client';
import fetch from 'isomorphic-fetch';
import { DfuseSearcher } from '../src/dfuse';

type TransferPayload = {
  from: string;
  to: string;
  quantity: string;
  memo: string;
};

const client = createDfuseClient({
  // DFUSE community edition
  authentication: false,
  network: `eos.dfuse.eosnation.io`,
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
});

const TIMEOUT = 15000;
jest.setTimeout(2 * TIMEOUT);

describe(`dfuse searcher`, () => {
  it(`fetches transfers of b1`, async () => {
    expect.assertions(2);

    const searcher = new DfuseSearcher({ client });

    const actionTraceMatcher: Parameters<typeof searcher['searchTransactions']>[1] = trace => {
      if (trace.receiver !== `b1`) return false;

      return (
        trace.account === `eosio.token` &&
        trace.name === `transfer` &&
        (trace.data.from === `b1` || trace.data.to === `b1`)
      );
    };

    const searchString = `receiver:b1 account:eosio.token action:transfer`;
    for await (const traces of searcher.searchTransactions<TransferPayload>(
      searchString,
      actionTraceMatcher,
      {
        limit: 1,
        backward: false,
      },
    )) {
      expect(traces.length).toBe(1);
      expect(traces[0].data.memo).toBe(
        `Never doubt that a small group of thoughtful, committed citizens can change the world; indeed, it's the only thing that ever has - eosacknowledgments.io`,
      );
      break;
    }
  });

  it(`fetches backward`, async () => {
    expect.assertions(2);

    const searcher = new DfuseSearcher({ client });

    const actionTraceMatcher: Parameters<typeof searcher['searchTransactions']>[1] = trace => {
      return true;
    };

    const searchString = `account:mooncakepool action:harvest`;
    for await (const traces of searcher.searchTransactions<any>(searchString, actionTraceMatcher, {
      limit: 1,
      backward: true,
    })) {
      expect(traces.length).toBe(1);
      expect(traces[0].timestamp.getTime() > new Date(`2020-10-01T00:00:00.000Z`).getTime()).toBe(
        true,
      );
      break;
    }
  });
});
