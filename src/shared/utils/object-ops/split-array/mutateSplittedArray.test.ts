import { mutateSplittedArray } from './mutateSplittedArray';

describe('Тестирование способов разбить массив (мутации)', () => {
  test('case 1: Разбиение массива', () => {
    const mutatedList = Array.from({ length: 100000 }, (_, index) => index + 1)

    console.time('arr mutation 1')
    mutateSplittedArray({
      list: mutatedList,
      pageLimit: 10,
    });
    // const expected = [
    //   [
    //     { a: 1 },
    //     { x: 1 },
    //   ],
    //   [
    //     { y: 1 },
    //   ]
    // ];
    console.timeEnd('arr mutation 1')

    expect(mutatedList).toEqual(mutatedList);
  })
})
