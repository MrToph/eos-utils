import * as util from 'util';
import zlib from 'zlib';
import { JsonRpc, Api } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import { SigningRequest } from 'eosio-signing-request';
import { TEosAction } from './types';

const textEncoder = new util.TextEncoder();
const textDecoder = new util.TextDecoder();

export const createSigningRequest = async (actions: TEosAction[], rpc: JsonRpc) => {
  const eos = new Api({
    rpc,
    textDecoder: textDecoder as any,
    textEncoder,
    signatureProvider: new JsSignatureProvider([]),
  });

  // options for the signing request
  const opts = {
    // string encoder
    textEncoder,
    // string decoder
    textDecoder,
    // zlib string compression (optional, recommended)
    zlib: {
      deflateRaw: (data: any) => new Uint8Array(zlib.deflateRawSync(Buffer.from(data))),
      inflateRaw: (data: any) => new Uint8Array(zlib.inflateRawSync(Buffer.from(data))),
    },
    // Customizable ABI Provider used to retrieve contract data
    abiProvider: {
      getAbi: async (account: string) => eos.getAbi(account),
    },
  };

  const request = await SigningRequest.create({ actions }, opts);
  return request;
};