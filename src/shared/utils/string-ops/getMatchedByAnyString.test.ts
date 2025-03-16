import { getMatchedByAnyString } from './getMatchedByAnyString';

describe('Тестирование регулярок', () => {
  test('case 1: Соответствие строки: ok', () => {
    const tested = getMatchedByAnyString({
      tested: 'ABORTED_SANCTIONED',
      expected: [
        'ABORTED',
        'SANCTIONED',
      ],
    });
    const expected = true;

    expect(tested).toEqual(expected);
  });

  test('case 2: Соответствие строки: ok', () => {
    const tested = getMatchedByAnyString({
      tested: 'ABORTED_SANCTIONED',
      expected: [
        'ABORTED1',
        'SANCTIONED',
      ],
    });
    const expected = true;

    expect(tested).toEqual(expected);
  });

  test('case 3: Соответствие строки: fail', () => {
    const tested = getMatchedByAnyString({
      tested: 'ABORTED_SANCTIONED',
      expected: [
        'ABORTED1',
        'SANCTIONED1',
      ],
    });
    const expected = false;

    expect(tested).toEqual(expected);
  });

  test('case 4: Соответствие строки: ok', () => {
    const tested = getMatchedByAnyString({
      tested: 'ABORTED_SANCTIONED',
      expected: ['ABORTED_SANCTIONED'],
    });
    const expected = true;

    expect(tested).toEqual(expected);
  });

  test('case 5: Соответствие строки: fail', () => {
    const tested = getMatchedByAnyString({
      tested: 'ABORTED_SANCTIONED',
      expected: ['word--no-spaces--ABORTED_SANCTIONED'],
    });
    const expected = false;

    expect(tested).toEqual(expected);
  });

  test('case 6: Соответствие строки: Предполагаемая часть урла для фрейма с хешом: ok', () => {
    const tested = getMatchedByAnyString({
      tested: '/dms-insurance.web/dms#/etc',
      expected: ['/dms-insurance.web/dms#'],
    });
    const expected = true;

    expect(tested).toEqual(expected);
  });

  test('case 7: Соответствие строки: Предполагаемая внешняя ссылка: ok', () => {
    const tested = getMatchedByAnyString({
      tested: 'https://google.com',
      expected: ['https://', 'http://'],
    });
    const expected = true;

    expect(tested).toEqual(expected);
  });
});
