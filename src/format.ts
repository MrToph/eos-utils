type TBlockExplorer = `bloks` | `eosq`;

export const formatBlockExplorerTransaction = (blockExplorer: TBlockExplorer) => (
  transactionId: string,
) => {
  switch (blockExplorer) {
    case `bloks`:
      return `https://bloks.io/transaction/${transactionId}`;
    case `eosq`:
      return `https://eos.eosq.eosnation.io/tx/${transactionId}`;
    default:
      throw new Error(`Unsupported block explorer: ${blockExplorer}`);
  }
};
