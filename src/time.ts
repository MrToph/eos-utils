import { JsonRpc } from 'eosjs';

const BLOCK_TIMESTAMP_EPOCH = 946684800000; // milliseconds from epoch to 2000
const BLOCK_INTERVAL_MS = 500;

/**
 * Warning: This function does a binary search through with get_block endpoints
 * making it very inefficient.
 */
// export const dateToBlockNumber = (rpc: JsonRpc) => async (date: Date) => {
//   console.warn(`dateToBlockNumber is deprecated and will be removed soon.`);
//   const dateTime = date.getTime();
//   const head = await rpc.get_info();
//   let startBlock = 1;
//   let endBlock = head.head_block_num;

//   /* eslint-disable no-await-in-loop */
//   while (startBlock <= endBlock) {
//     let midBlock = Math.floor((startBlock + endBlock) / 2);
//     const midDateTime = (await blockNumberToDate(rpc)(midBlock)).getTime();

//     if (Math.abs(dateTime - midDateTime) <= BLOCK_INTERVAL_MS / 2) {
//       return midBlock;
//     }

//     if (dateTime < midDateTime) {
//       endBlock = midBlock - 1;
//     } else {
//       startBlock = midBlock + 1;
//     }
//   }
//   return -1;
// };

export const blockNumberToDate = (rpc: JsonRpc) => async (blockNumber: number) => {
  const blockInfo = await rpc.get_block(blockNumber);
  return new Date(`${blockInfo.timestamp}Z`);
};
