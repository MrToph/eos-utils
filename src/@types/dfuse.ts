export type TActionTraceMatcher<T = any> = (actionTrace: TActionInfo<T>) => boolean;

export type TActionInfo<T = any> = {
  blockNumber: number;
  timestamp: Date;
  account: string;
  receiver: string;
  name: string;
  data: T;
  console: string;
  txId: string;
  globalSequence: number;
  authorization: {
    actor: string;
    permission: string;
  }[];
};
