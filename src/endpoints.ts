/**
 * Adapted from:
 * Credits: soulmachine: https://github.com/soulmachine/eos-endpoint/blob/master/src/index.ts
 */

import axios from 'axios';
import https from 'https';
import flatten from 'lodash/flatten';
import get from 'lodash/get';
import uniqBy from 'lodash/uniqBy';
import { NetworkName } from './@types';
import { PromiseAllSettledFilterFulfilled, sleep } from './utils/promise';
import { getChainIdForNetwork } from './network';

interface ProducerInfo {
  owner: string;
  total_votes: string;
  producer_key: string;
  is_active: boolean;
  url: string;
  unpaid_blocks: number;
  last_claim_time: string;
  location: number;
}

interface BpLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface BpNode {
  location: BpLocation;
  node_type: string;
  api_endpoint?: string;
  ssl_endpoint?: string;
  p2p_endpoint?: string;
}

interface BpJson {
  producer_account_name: string;
  producer_public_key: string;
  org: {
    [key: string]: any;
  };
  nodes: BpNode[];
}

const EOS_CHAIN_ID = getChainIdForNetwork(`mainnet`);

const BP_SEEDS = [
  'https://mainnet.eoscanada.com',
  'https://eos-api.b1.run',
  'https://mainnet.meet.one',
  'https://eos.newdex.one',
  'https://api.eosnewyork.io',
  'https://node.eosflare.io',
  'https://api.helloeos.com.cn',
  'https://api.eoseoul.io',
  'https://api.eostitan.com',
  'https://api.bitmars.one',
  'https://eos.eosphere.io',
  'https://publicapi-mainnet.eosauthority.com',
  'https://bp.whaleex.com',
  'https://mainnet.eoscannon.io',
  'https://eu.eosdac.io',
  'https://api.main.alohaeos.com',
  'https://api.eosargentina.io',
  'https://mainnet.eosamsterdam.net',
  'https://bp.cryptolions.io',
  'https://api.eosdublin.io',
  'https://mainnet.genereos.io',
  'https://api.eossweden.org',
  'https://api.tokenika.io',
  'https://api.eoslaomao.com',
  'https://hapi.eosrio.io',
  'https://api.sheos.org',
  'https://mainnet.get-scatter.com',
  'https://eos.greymass.com',
  'https://mainnet.libertyblock.io:7777',
  'https://api.eosrapid.com',
  'https://api.eosbeijing.one',
  'https://eos.infstones.io',
  'https://node1.zbeos.com',
  'https://api.zbeos.com',
  'https://api.cypherglass.com',
  'https://eos.eoscafeblock.com',
];

async function post(url: string, data: { [key: string]: any }, timeoutMs = 60000): Promise<any> {
  const agent = new https.Agent({
    rejectUnauthorized: false,
    timeout: timeoutMs,
  });
  const response = await axios.post(url, data, {
    httpsAgent: agent,
  });
  if (
    response.status !== 200 ||
    !(response.headers['content-type'] as string).startsWith('application/json')
  ) {
    throw new Error('Malformed response');
  }
  return response.data;
}

async function getProducers(topXBpsToCheck = 50): Promise<ProducerInfo[]> {
  for (let i = 0; i < BP_SEEDS.length; i += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const data = await post(`${BP_SEEDS[i]}/v1/chain/get_producers`, {
        json: true,
        lower_bound: '',
        limit: Number.parseInt(`${topXBpsToCheck}`, 10),
      });
      const producers = (data.rows as ProducerInfo[]).filter(p => p.is_active);
      return producers;
    } catch (e) {
      // do nothing, let next BP seed try
    }
  }
  throw new Error(`getProducers() failed all BP seeds`);
}

async function getBpApiEndpoints(url: string): Promise<string[]> {
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });
  const bpJsonUrl = url.endsWith('/') ? `${url}bp.json` : `${url}/bp.json`;

  try {
    const response = await axios.get(bpJsonUrl, {
      httpsAgent: agent,
      timeout: 5000,
    });
    if (
      response.status !== 200 ||
      response.statusText !== 'OK' ||
      !(response.headers['content-type'] as string).startsWith('application/json')
    ) {
      return [];
    }

    const bpJson = response.data as BpJson;
    const httpEndpoints = bpJson.nodes.filter(n => n.api_endpoint).map(n => n.api_endpoint!);
    const httpsEndpoints = bpJson.nodes.filter(n => n.ssl_endpoint).map(n => n.ssl_endpoint!);
    return httpEndpoints.concat(httpsEndpoints);
  } catch (e) {
    return [];
  }
}

type TEndpointCheck = {
  endpoint: string;
  latency: number;
};
async function check(endpoint: string, options: getApiEndpointsOptions): Promise<TEndpointCheck> {
  const startTime = Date.now();

  const response = await post(`${endpoint}/v1/chain/get_info`, {});
  if (response.chain_id !== EOS_CHAIN_ID) throw new Error(`Invalid chain_id`);

  const timeDiff = new Date().getTime() - new Date(`${response.head_block_time}Z`).getTime();
  if (timeDiff > options.maxMsBehindHead) {
    throw new Error(
      `API too far behind head ${endpoint}: ${response.head_block_time} (${timeDiff}ms)`,
    );
  }

  try {
    await post(`${endpoint}/v1/chain/push_transaction`, {});
    throw new Error(`should not be accepted`);
  } catch (transactionError) {
    const eosErrorWhat = get(transactionError, `response.data.error.what`);

    // if it shows correct error, don't rethrow
    if (!/Invalid packed transaction/i.test(eosErrorWhat)) {
      throw transactionError;
    }
  }
  const endTime = Date.now();
  const latency = Math.round((endTime - startTime) / 3);

  return {
    endpoint,
    latency,
  };
}

async function validateBpEndpoints(producer: ProducerInfo, options: getApiEndpointsOptions) {
  const endpoints = await getBpApiEndpoints(producer.url);
  const validEndpoints = await PromiseAllSettledFilterFulfilled(
    endpoints.map(apiEndpoint => check(apiEndpoint, options)),
  );

  return validEndpoints;
}

async function validateBpEndpointsTimed(
  producers: ProducerInfo[],
  options: getApiEndpointsOptions,
) {
  const endpointsPerBp = await PromiseAllSettledFilterFulfilled<TEndpointCheck[]>(
    producers.map(
      producer =>
        Promise.race([
          validateBpEndpoints(producer, options),
          sleep(options.timeoutMs, true),
        ]) as ReturnType<typeof validateBpEndpoints>,
    ),
  );

  return uniqBy(flatten(endpointsPerBp), x => x.endpoint);
}

type getApiEndpointsOptions = {
  timeoutMs: number;
  maxLatencyMs: number;
  maxMsBehindHead: number;
  topXBpsToCheck: number;
};
/**
 * Get a list of valid API endpoints.
 *
 * @returns A list of API endpoints, empty if none
 */
export async function getApiEndpoints(
  networkName: NetworkName,
  options: Partial<getApiEndpointsOptions> = {},
): Promise<TEndpointCheck[]> {
  if (networkName !== `mainnet`)
    throw new Error(`getApiEndpoints: Network ${networkName} not supported yet.`);

  const mergedOptions = {
    timeoutMs: 15 * 1000,
    maxLatencyMs: 5 * 1000,
    maxMsBehindHead: 1 * 1000,
    topXBpsToCheck: 80,
    ...options,
  };
  const producers = await getProducers(mergedOptions.topXBpsToCheck);

  let validEndpoints = await validateBpEndpointsTimed(producers, mergedOptions);

  validEndpoints = validEndpoints.sort((x, y) => x.latency - y.latency);
  if (typeof options.maxLatencyMs === `number`) {
    validEndpoints = validEndpoints.filter(x => x.latency <= options.maxLatencyMs!);
  }

  return validEndpoints;
}
