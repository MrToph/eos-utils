import { JsonRpc } from 'eosjs';
// @ts-ignore
import fetch from 'isomorphic-fetch';
import { TEOSNetwork, NetworkName, isNetworkName } from './@types';

export const getChainIdForNetwork = (networkName: NetworkName) => {
  switch (networkName) {
    case `eos`: {
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
    case `eos`: {
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
    case `waxtest`: {
      return `https://waxtestnet.greymass.com:443`;
    }
    default:
      throw new Error(`Unknown network "${networkName}"`);
  }
};

type CreateNetworkOptions = {
  fetch?: any;
};
export const createNetworkRandomEndpoint = (
  networkName: NetworkName,
  options?: CreateNetworkOptions,
) => {
  const endpoint = getDefaultHttpEndpoint(networkName);
  return createNetwork(networkName, endpoint, options);
};

export const createNetwork = (
  networkNameOrChainId: NetworkName | string,
  nodeEndpoint: string,
  options: CreateNetworkOptions = {},
): TEOSNetwork & { rpc: JsonRpc } => {
  let chainId = networkNameOrChainId;
  let networkName: NetworkName | undefined;
  if (isNetworkName(networkNameOrChainId)) {
    networkName = networkNameOrChainId;
    chainId = getChainIdForNetwork(networkNameOrChainId);
  }

  const mergedOptions = {
    fetch,
    ...options,
  };

  const matches = /^(https?):\/\/(.+?)(:\d+){0,1}$/.exec(nodeEndpoint);
  if (!matches) {
    throw new Error(
      `Could not parse EOS HTTP endpoint. Needs protocol and port: "${nodeEndpoint}"`,
    );
  }

  const [, httpProtocol, host, portMatch] = matches;
  const portString = portMatch
    ? portMatch.replace(/\D/gi, ``)
    : httpProtocol === `https`
    ? `443`
    : `80`;
  const port = Number.parseInt(portString, 10);

  const rpc = new JsonRpc(nodeEndpoint, mergedOptions);

  return {
    networkName,
    chainId,
    protocol: httpProtocol,
    host,
    port,
    nodeEndpoint,
    rpc,
  };
};
