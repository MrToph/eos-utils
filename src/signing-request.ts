import * as util from 'util';
import zlib from 'zlib';
import { JsonRpc, Api } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import { SigningRequest } from 'eosio-signing-request';
import { TEosAction } from './@types';
import { textEncoder, textDecoder } from './utils/poly-fill';

export const createSigningRequest = async (
  actions: TEosAction[],
  rpc: JsonRpc,
  options: Parameters<typeof SigningRequest['create']>[1] = {},
) => {
  const eos = new Api({
    rpc,
    textDecoder,
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
    ...options,
  };

  const request = await SigningRequest.create({ actions }, opts);
  return request;
};
