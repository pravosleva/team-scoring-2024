// NOTE: For example

export { };
declare global {
  interface Window {
    ym: (counter: number, action: 'hit', event: string) => void;
  }
}
