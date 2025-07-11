import { getBinarySearchedIndexByProp } from './getBinarySearchedIndexByProp'

describe('Тестирование способов разбить массив (создание объекта)', () => {
  test('getBinarySearchedIndexByProp: case 1: Not found', () => {
    const tested = getBinarySearchedIndexByProp({
      items: [
        { ts: 1 },
        { ts: 2 },
      ],
      target: {
        value: 0,
        propName: 'ts',
      },
    })
    const expected = -1
    expect(tested).toStrictEqual(expected)
  })

  test('getBinarySearchedIndexByProp: case 2: Found', () => {
    const tested = getBinarySearchedIndexByProp({
      items: [
        { ts: 1 },
        { ts: 2 },
      ],
      target: {
        value: 2,
        propName: 'ts',
      },
    })
    const expected = 1
    expect(tested).toStrictEqual(expected)
  })
})
