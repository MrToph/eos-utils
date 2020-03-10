import { JsonRpc } from 'eosjs';

const MAX_PAGINATION_FETCHES = 20;

// https://github.com/EOSIO/eosjs-api/blob/master/docs/api.md#eos.getTableRows
type GetTableRowsOptions = {
  json?: boolean;
  code?: string;
  scope?: string;
  table?: string;
  lower_bound?: number | string;
  upper_bound?: number | string;
  limit?: number;
  key_type?: string;
  index_position?: number | string;
  reverse?: boolean;
};

// work around the limit bug in nodeos due to max timeout
// https://github.com/EOSIO/eos/issues/3965
export const fetchRows = (rpc: JsonRpc) => async <T>(
  options: GetTableRowsOptions,
): Promise<T[]> => {
  const mergedOptions = {
    json: true,
    lower_bound: undefined,
    upper_bound: undefined,
    limit: 9999,
    ...options,
  };

  let lowerBound = mergedOptions.lower_bound;

  const result = await rpc.get_table_rows({
    ...mergedOptions,
    lower_bound: lowerBound,
  });

  return result.rows;
};

export const fetchAllRows = (rpc: JsonRpc) => async <T>(
  options: GetTableRowsOptions,
  indexName = `id`,
): Promise<T[]> => {
  const mergedOptions = {
    json: true,
    lower_bound: 0,
    upper_bound: undefined,
    limit: 9999,
    ...options,
  };

  let rows: T[] = [];
  let lowerBound = mergedOptions.lower_bound;

  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < MAX_PAGINATION_FETCHES; i += 1) {
    const result = await rpc.get_table_rows({
      ...mergedOptions,
      lower_bound: lowerBound,
    });
    rows = rows.concat(result.rows);

    if (!result.more || result.rows.length === 0) break;

    // EOS 2.0 api
    if (typeof result.next_key !== `undefined`) {
      lowerBound = result.next_key;
    } else {
      lowerBound = Number.parseInt(`${result.rows[result.rows.length - 1][indexName]}`, 10) + 1;
    }
  }

  return rows;
};

type ScopeResult = {
  code: string;
  count: number;
  payer: string;
  scope: string;
  table: string;
};

export const fetchAllScopes = (rpc: JsonRpc) => async (
  contract: string,
  table: string,
): Promise<string[]> => {
  const mergedOptions = {
    json: true,
    lower_bound: undefined,
    upper_bound: undefined,
    limit: 9999,
    code: contract,
    table,
  };
  const rows = (await rpc.get_table_by_scope(mergedOptions)).rows as ScopeResult[];
  return rows.map(row => row.scope);
};
