import { getNestedValue } from './getNestedValue';

describe('Тестирование извлечения свойства', () => {
  test('case 1', () => {
    const tested = getNestedValue({
      obj: {
        a: {
          b: {
            c: 1
          }
        }
      },
      path: 'a.b.c',
    });
    const expected = 1

    expect(tested).toEqual(expected);
  })

  test('case 2', () => {
    const tested = getNestedValue({
      obj: {
        a: {
          b: {
            c: [1, 2, 3]
          }
        }
      },
      path: 'a.b.c',
    });
    const expected = [1, 2, 3]

    expect(tested).toEqual(expected);
  })

  test('case 3', () => {
    const tested = getNestedValue({
      obj: {
        a: {
          b: {
            c: [1, 2, 3]
          }
        }
      },
      path: 'a.b.c.d',
    });
    const expected = undefined

    expect(tested).toEqual(expected);
  })

  test('case 4', () => {
    const tested = getNestedValue({
      obj: {
        a: {
          b: {
            c: [1, 2, 3]
          }
        }
      },
      path: 'a.b',
    });
    const expected = {
      c: [1, 2, 3]
    }

    expect(tested).toEqual(expected);
  })

  test('case 5', () => {
    const tested = getNestedValue({
      obj: {
        a: {
          b: {
            c: [1, 2, 3]
          }
        }
      },
      path: 'a',
    });
    const expected = {
      b: {
        c: [1, 2, 3]
      }
    }

    expect(tested).toEqual(expected);
  })
})
