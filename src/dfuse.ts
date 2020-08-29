import { ActionTrace, DfuseClient, SearchTransactionRow } from '@dfuse/client';
import { TActionInfo, TActionTraceMatcher } from './@types/dfuse';

export class DfuseSearcher {
  private client: DfuseClient;

  constructor({ client }: { client: DfuseClient }) {
    this.client = client;
  }

  public getActionTraces(
    tx: SearchTransactionRow,
    isMatchingTrace: TActionTraceMatcher,
  ): TActionInfo[] {
    const matchingTraces = [] as ActionTrace<any>[];

    // BFS through transaction traces
    const traces = tx.lifecycle.execution_trace!.action_traces;
    while (traces.length > 0) {
      const curTrace = traces.shift()!;

      if (isMatchingTrace(curTrace)) {
        matchingTraces.push(curTrace);
      }

      if (Array.isArray(curTrace.inline_traces)) {
        traces.push(...curTrace.inline_traces);
      }
    }

    return matchingTraces.map(trace => {
      return {
        blockNumber: trace.block_num,
        timestamp: new Date(`${trace.block_time}Z`),
        account: trace.act.account,
        name: trace.act.name,
        data: trace.act.data,
        print: trace.console,
        trxId: trace.trx_id,
        // https://github.com/EOSIO/eos/blob/master/libraries/chain/apply_context.cpp#L127
        // global_sequence unique per non-failed transactions
        globalSequence: Number.parseInt(String(trace.receipt.global_sequence), 10),
        // recv_sequence unique per contract, is a counter incremeted each time account is a receiver
        receiveSequence: Number.parseInt(String(trace.receipt.recv_sequence), 10),
        // not necessarily unique as it just hashes the action data?
        actDigest: trace.receipt.act_digest,
      };
    });
  }

  public async *searchTransactions<T = any>(
    searchQuery: string,
    actionTraceMatcher: TActionTraceMatcher,
    options: {
      toBlock?: number;
      limit?: number;
    },
  ) {
    const mergedOptions = {
      toBlock: undefined,
      limit: 100,
      ...options,
    };
    let response: any;
    let cursor = ``;

    /* eslint-disable no-await-in-loop */
    do {
      try {
        // sometimes dfuse searchTransaction gets stuck on mainnet and takes ages or never returns
        response = await Promise.race([
          new Promise((res, rej) => {
            setTimeout(() => {
              rej(new Error(`searchTransactions took too long.`));
            }, 20 * 1e3);
          }),
          this.client.searchTransactions(searchQuery, {
            limit: mergedOptions.limit,
            sort: `desc`,
            cursor,
            startBlock: mergedOptions.toBlock,
          }),
        ]);
      } catch (error) {
        let { message } = error;
        if (error.details && error.details.errors)
          message = `${message}. ${JSON.stringify(error.details.errors)}`;

        console.error(`dfuse: ${message}`);
        // try again
        continue;
      }

      cursor = response.cursor;

      const newTransactions = response.transactions;
      if (newTransactions && newTransactions[0]) {
        const newActions = [] as TActionInfo<T>[];
        newTransactions.forEach((trans: any) => {
          const actions = this.getActionTraces(trans, actionTraceMatcher);
          newActions.push(...actions);
        });
        yield newActions;
      }
    } while (cursor !== ``);
  }
}
