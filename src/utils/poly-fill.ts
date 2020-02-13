const isBrowser = () => typeof window !== `undefined`;

/* eslint-disable no-undef, global-require */
const textEncoder = isBrowser() ? new window.TextEncoder() : new (require(`util`).TextEncoder)();
const textDecoder = isBrowser() ? new window.TextDecoder() : new (require(`util`).TextDecoder)();

export { textEncoder, textDecoder };
