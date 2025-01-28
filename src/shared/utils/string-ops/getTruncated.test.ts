import { expect, test } from 'vitest'
import { getTruncated } from './getTruncated'

test('getTruncated: 1234 to equal 123...', () => {
  expect(getTruncated('1234', 3)).toBe('123...')
})
