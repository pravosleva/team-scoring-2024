const _ceaserCipherExp = XCaesar({ shift: 3, alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ:/.' })

const _original = 'http://pravosleva.pro'

console.log('-xcaesar tst _original:')
console.log(_original)

const _encrypted = _ceaserCipherExp.encrypt(_original)
console.log(_encrypted)
console.log('-')
