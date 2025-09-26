import { getColorsRamp } from './getColorsRamp'

describe('Тестирование способов разбить массив цветов на переходные значения', () => {
  test('case 1: Разбиение массива (0 points between, expected 2 colors)', () => {
    const tested = getColorsRamp('#ff7300', '#1976d2', 0)
    const expected = [
      "#ff7300",
      "#1976d2",
    ]

    expect(tested).toEqual(expected)
  })

  test('case 2: Разбиение массива (1 point between, expected 3 colors)', () => {
    const tested = getColorsRamp('#ff7300', '#1976d2', 1)
    const expected = [
      "#ff7300",
      "#8c7569",
      "#1976d2",
    ]

    expect(tested).toEqual(expected)
  })

  test('case 3: Разбиение массива цветов (2 points between, expected  colors)', () => {
    const tested = getColorsRamp('#ff7300', '#1976d2', 2)
    const expected = [
      "#ff7300",
      "#b27446",
      "#65758c",
      "#1976d2",
    ]

    expect(tested).toEqual(expected)
  })
})
