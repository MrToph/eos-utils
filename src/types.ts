import BigNumber from 'bignumber.js';

export type TEOSNetwork = {
  chainId: string;
  nodeEndpoint: string;
  protocol: string;
  host: string;
  port: number;
};

export type GetChainInfoResult = {
  server_version: string;
  chain_id: string;
  head_block_num: number;
  last_irreversible_block_num: number;
  last_irreversible_block_id: string;
  head_block_id: string;
  head_block_time: string;
  head_block_producer: string;
  virtual_block_cpu_limit: number;
  virtual_block_net_limit: number;
  block_cpu_limit: number;
  block_net_limit: number;
  server_version_string: string;
  fork_db_head_block_num: number;
  fork_db_head_block_id: string;
};

export type TEosAction<T = any> = {
  account: string;
  name: string;
  authorization: { actor: string; permission: string }[];
  data: T;
};

export type TMicroseconds = {
  _count: string;
};

type TActionTrace = {
  console: string;
  inline_traces: TActionTrace[];
};

export type TTransactionResult = {
  result: {
    transaction_id: string;
    processed: {
      action_traces: TActionTrace[];
    };
  };
};

// mimicks EOS C++ smart contract asset and symbol class
export type TAssetSymbol = {
  symbolCode: string;
  precision: number;
};

export type TAsset = {
  amount: BigNumber;
  symbol: TAssetSymbol;
};
