// NOTE: Remember! Full path regarding main file (dx.shared-worker.js for example)
importScripts('../utils/xcaesar/src.js')
// importScripts('../utils/xcaesar/_t.js')

const ceaserCipher = XCaesar({ shift: 3, alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ:/.' })
const gu = () => ceaserCipher.decrypt('zvvabbsudyrvohydcsur')
// const gu = () => ceaserCipher.decrypt('kwwsabbsudyrvohydcsur')
