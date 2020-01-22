import { JsonRpc } from 'eosjs';
import { TEOSNetwork, NetworkName } from './types';

export const getChainIdForNetwork = (networkName: NetworkName) => {
  switch (networkName) {
    case `mainnet`: {
      return `aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906`;
    }
    case `kylin`: {
      return `5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191`;
    }
    case `jungle`: {
      return `e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473`;
    }
    case `wax`: {
      return `1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4`;
    }
    default:
      throw new Error(`Unknown network "${networkName}"`);
  }
};

// TODO: use something like eos-endpoints to always get a low latency once
const getDefaultHttpEndpoint = (networkName: NetworkName) => {
  switch (networkName) {
    case `mainnet`: {
      return `https://eos.greymass.com:443`;
    }
    case `kylin`: {
      return `https://kylin-dsp-2.liquidapps.io:443`;
    }
    case `jungle`: {
      return `https://jungle2.cryptolions.io:443`;
    }
    case `wax`: {
      return `https://chain.wax.io:443`;
    }
    default:
      throw new Error(`Unknown network "${networkName}"`);
  }
};

export const createNetworkRandomEndpoint = (networkName: NetworkName) => {
  const endpoint = getDefaultHttpEndpoint(networkName);
  return createNetwork(networkName, endpoint);
};

export const createNetwork = (
  networkName: NetworkName,
  nodeEndpoint: string,
): TEOSNetwork & { rpc: JsonRpc } => {
  const chainId = getChainIdForNetwork(networkName);

  const matches = /^(https?):\/\/(.+):(\d+)\D*$/.exec(nodeEndpoint);
  if (!matches) {
    throw new Error(
      `Could not parse EOS HTTP endpoint. Needs protocol and port: "${nodeEndpoint}"`,
    );
  }

  const [, httpProtocol, host, port] = matches;

  const rpc = new JsonRpc(nodeEndpoint);

  return {
    networkName,
    chainId,
    protocol: httpProtocol,
    host,
    port: Number.parseInt(port, 10),
    nodeEndpoint,
    rpc,
  };
};
