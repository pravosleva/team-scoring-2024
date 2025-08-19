const defaults = {
  alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
}
function Translator(sourceAlphabet, targetAlphabet) {
  return function (message) {
    return message
      .split('')
      .map((char) => targetAlphabet[sourceAlphabet.indexOf(char)] || char)
      .join('')
  }
}
function XCaesar(options) {
  const plainAlphabet = (options.alphabet || defaults.alphabet).split('')
  const cipherAlphabet = plainAlphabet.map((_, idx, arr) => arr[(idx + options.shift) % arr.length])
  return {
    options,
    encrypt: Translator(plainAlphabet, cipherAlphabet),
    decrypt: Translator(cipherAlphabet, plainAlphabet),
  }
}
