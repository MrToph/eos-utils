const isBrowser = () => typeof window !== `undefined`;

/* eslint-disable no-undef, global-require */
// even if window exists, we cannot be sure if TextEncoder exists
// for example when testing with js-dom
const textEncoder =
  isBrowser() && window.TextEncoder
    ? new window.TextEncoder()
    : new (require(`util`).TextEncoder)();
const textDecoder =
  isBrowser() && window.TextDecoder
    ? new window.TextDecoder()
    : new (require(`util`).TextDecoder)();

export { textEncoder, textDecoder };
