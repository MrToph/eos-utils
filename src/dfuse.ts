import flatten from 'lodash/flatten';
import { ActionTrace, DfuseClient, SearchTransactionRow } from '@dfuse/client';
import { TEosAction } from './@types';
import { TActionInfo, TActionTraceMatcher } from './@types/dfuse';

type DfuseSearchTransactionTrace<T = any> = {
  block: {
    num: string;
    id: string;
    timestamp: string;
  };
  id: string;
  matchingActions: {
    account: string;
    name: string;
    json: T;
    seq: string;
    receiver: string;
    console: string;
    authorization: {
      actor: string;
      permission: string;
    }[];
  }[];
};
export class DfuseSearcher {
  private client: DfuseClient;

  constructor({ client }: { client: DfuseClient }) {
    this.client = client;
  }

  public filterActionTraces(
    actions: TActionInfo[],
    isMatchingTrace: TActionTraceMatcher,
  ): TActionInfo[] {
    return actions.filter(isMatchingTrace);
  }

  private buildGraphQLSearchString(
    searchQuery: string,
    options: {
      lowBlock?: number;
      highBlock?: number;
      limit: number;
      backward: boolean;
    },
    cursor: string,
  ) {
    let query = `query {
      ${
        options.backward ? `searchTransactionsBackward` : `searchTransactionsForward`
      }(query: "${searchQuery}"`;
    if (options.lowBlock) query += `, lowBlockNum: ${options.lowBlock}`;
    if (options.highBlock) query += `, highBlockNum: ${options.highBlock}`;

    query += `, limit: ${options.limit}`;
    query += `, cursor: "${cursor}") {
        results {
          cursor
          trace {
            block {
              num
              id
              timestamp
            }
            id
            matchingActions {
              account
              name
              json
              seq
              receiver
              console
              authorization {
                actor
                permission
              }
            }
          }
        }
      }
    }`;
    return query;
  }

  public async *searchTransactions<T = any>(
    searchQuery: string,
    actionTraceMatcher: TActionTraceMatcher,
    options: {
      fromBlockIncluding?: number;
      toBlockIncluding?: number;
      limit?: number;
      backward?: boolean;
    },
  ) {
    const mergedOptions = {
      highBlock: options.toBlockIncluding || undefined,
      lowBlock: options.fromBlockIncluding || undefined,
      limit: options.limit || 100,
      backward: options.backward || false,
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
          this.client.graphql(this.buildGraphQLSearchString(searchQuery, mergedOptions, cursor)),
        ]);
      } catch (error) {
        let { message } = error;
        if (error.details && error.details.errors)
          message = `${message}. ${JSON.stringify(error.details.errors)}`;

        console.error(`dfuse: ${message}`);
        // try again
        continue;
      }
      if (response.errors)
        throw new Error(response.errors.map((error: Error) => error.message).join(`\n`));

      const { results } = response.data[
        options.backward ? `searchTransactionsBackward` : `searchTransactionsForward`
      ];
      cursor = results.length > 0 ? results[results.length - 1].cursor : ``;
      const traces: DfuseSearchTransactionTrace<T>[] = results.map((obj: any) => obj.trace);

      const newActions: TActionInfo<T>[] = flatten(
        traces.map(trace => {
          const blockNumber = Number.parseInt(trace.block.num, 10);
          const timestamp = new Date(trace.block.timestamp);
          const txId = new Date(trace.id);

          return trace.matchingActions.map(actionTrace => {
            return {
              blockNumber,
              timestamp,
              account: actionTrace.account,
              name: actionTrace.name,
              receiver: actionTrace.receiver,
              data: actionTrace.json,
              console: actionTrace.console,
              txId,
              globalSequence: actionTrace.seq,
              authorization: actionTrace.authorization,
            };
          });
        }),
      ) as any;
      const actions = this.filterActionTraces(newActions, actionTraceMatcher);
      yield actions;
    } while (cursor !== ``);
  }
}
