import { getBinarySearchedValueByDotNotation2 } from './getBinarySearchedValueByDotNotation2'

describe('Тестирование способов разбить массив (создание объекта)', () => {
  test('getBinarySearchedValueByDotNotation2: case 1: Not found', () => {
    const tested = getBinarySearchedValueByDotNotation2<{ ts: number; id: number }, number>({
      items: [
        { ts: 1, id: 111 },
        { ts: 2, id: 222 },
        { ts: 3, id: 333 },
        { ts: 4, id: 444 },
        { ts: 5, id: 555 },
      ],
      target: {
        path: 'ts',
        critery: {
          value: 1,
          path: 'ts',
        },
      },
      sorted: 'ASC'
    }).result
    const expected = 1
    expect(tested).toStrictEqual(expected)
  })

  test('getBinarySearchedValueByDotNotation2: case 2', () => {
    const tested = getBinarySearchedValueByDotNotation2<{ ts: number; v: string }, string>({
      items: [
        { ts: 1, v: 'a' },
        { ts: 2, v: 'b' },
        { ts: 3, v: 'c' },
        { ts: 4, v: 'd' },
        { ts: 5, v: 'e' },
      ],
      target: {
        path: 'v',
        critery: {
          value: 1,
          path: 'ts',
        },
      },
      sorted: 'ASC'
    }).result
    const expected = 'a'
    expect(tested).toStrictEqual(expected)
  })

  test('getBinarySearchedValueByDotNotation2: case 3', () => {
    const tested = getBinarySearchedValueByDotNotation2<{ ts: number; v: { a: string; } }, string>({
      items: [
        { ts: 1, v: { a: 'one' } },
        { ts: 2, v: { a: 'two' } },
        { ts: 3, v: { a: '_3' } },
        { ts: 4, v: { a: '_4' } },
        { ts: 5, v: { a: '_5' } },
        { ts: 6, v: { a: '_6' } },
        { ts: 7, v: { a: '_7' } },
      ],
      target: {
        path: 'v.a',
        critery: {
          value: 3,
          path: 'ts',
        },
      },
      sorted: 'ASC'
    }).result
    const expected = '_3'
    expect(tested).toStrictEqual(expected)
  })

  test('getBinarySearchedValueByDotNotation2: case 4', () => {
    const tested = getBinarySearchedValueByDotNotation2<{ ts: number; v: { a: string; } }, string>({
      items: [
        { ts: 1, v: { a: 'one' } },
        { ts: 2, v: { a: 'two' } },
        { ts: 3, v: { a: 'three' } },
        { ts: 4, v: { a: 'four' } },
      ],
      target: {
        path: 'v.a',
        critery: {
          value: 1,
          path: 'ts',
        },
      },
      sorted: 'ASC'
    }).result
    const expected = 'one'
    expect(tested).toStrictEqual(expected)
  })

  test('getBinarySearchedValueByDotNotation2: case 5', () => {
    const tested = getBinarySearchedValueByDotNotation2<{ ts: number; v: { a: string; } }, string>({
      items: [
        { ts: 1, v: { a: 'one' } },
        { ts: 2, v: { a: 'two' } },
        { ts: 3, v: { a: 'three' } },
        { ts: 4, v: { a: 'four' } },
      ],
      target: {
        path: 'v.a',
        critery: {
          value: 1,
          path: 'ts',
        },
      },
      sorted: 'ASC'
    }).result
    const expected = 'one'
    expect(tested).toStrictEqual(expected)
  })

  test('getBinarySearchedValueByDotNotation2: case 6', () => {
    const tested = getBinarySearchedValueByDotNotation2<{ ts: number; v: { a: string; p: number; } }, number>({
      items: [
        { ts: 1, v: { a: 'one', p: 101 } },
        { ts: 2, v: { a: 'two', p: 100 } },
        { ts: 3, v: { a: 'three', p: 102 } },
        { ts: 4, v: { a: 'four', p: 99 } },
      ],
      target: {
        path: 'v.p',
        critery: {
          value: 2,
          path: 'ts',
        },
      },
      sorted: 'ASC'
    }).result
    const expected = 100
    expect(tested).toStrictEqual(expected)
  })

  test('getBinarySearchedValueByDotNotation2: case 7', () => {
    const tested = getBinarySearchedValueByDotNotation2<{ ts: number; v: { a: string; p: number; } }, number>({
      items: [
        { ts: 1, v: { a: 'one', p: 101 } },
        { ts: 2, v: { a: 'two', p: 100 } },
        { ts: 3, v: { a: 'three', p: 102 } },
        { ts: 4, v: { a: 'four', p: 99 } },
      ],
      target: {
        path: 'v.p',
        critery: {
          value: 5,
          path: 'ts',
        },
      },
      sorted: 'ASC'
    }).result
    const expected = undefined
    expect(tested).toStrictEqual(expected)
  })

  test('getBinarySearchedValueByDotNotation2: case 8', () => {
    const tested = getBinarySearchedValueByDotNotation2<
      {
        x: { id: number; ts: number; };
        v: { a: string; p: number; };
      },
      number
    >({
      items: [
        { x: { id: 0, ts: 1 }, v: { a: 'one', p: 101 } },
        { x: { id: 0, ts: 2 }, v: { a: 'two', p: 100 } },
        { x: { id: 7, ts: 3 }, v: { a: 'three', p: 102 } },
        { x: { id: 0, ts: 4 }, v: { a: 'four', p: 99 } },
      ],
      target: {
        path: 'v.p',
        critery: {
          value: 3,
          path: 'x.ts',
        },
      },
      sorted: 'ASC'
    }).result
    const expected = 102
    expect(tested).toStrictEqual(expected)
  })

  test('getBinarySearchedValueByDotNotation2: case 9', () => {
    const tested = getBinarySearchedValueByDotNotation2<
      {
        x: { id: number; ts: number; };
        v: { a: string; p: number; };
      },
      number
    >({
      items: [
        { x: { id: 0, ts: 1 }, v: { a: 'one', p: 101 } },
        { x: { id: 0, ts: 2 }, v: { a: 'two', p: 100 } },
        { x: { id: 7, ts: 3 }, v: { a: 'three', p: 102 } },
        { x: { id: 0, ts: 4 }, v: { a: 'four', p: 99 } },
      ],
      target: {
        path: '',
        critery: {
          value: 3,
          path: 'x.ts',
        },
      },
      sorted: 'ASC'
    }).result
    const expected = { x: { id: 7, ts: 3 }, v: { a: 'three', p: 102 } }
    expect(tested).toStrictEqual(expected)
  })
})
