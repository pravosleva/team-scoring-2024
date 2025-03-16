import { getMatchedByRegExp } from './getMatchedByRegExp';

describe('Тестирование регулярок', () => {
  test('case 1: Соответствие строки', () => {
    const tested = getMatchedByRegExp({
      tested: '[ABORTED_SANCTIONED]',
      regexp: /(?<=\[)(ABORTED_SANCTIONED)(?=\])/g,
    });
    const expected = true;

    expect(tested).toEqual(expected);
  });

  test('case 2: Соответствие строки', () => {
    const tested = getMatchedByRegExp({
      tested: '[request ABORTED_SANCTIONED]',
      regexp: /(?<=\[)(ABORTED_SANCTIONED)(?=\])/g,
    });
    const expected = false;

    expect(tested).toEqual(expected);
  });

  test('case 3: Соответствие строки', () => {
    const tested = getMatchedByRegExp({
      tested: '[job=1736247988279]',
      regexp: /(?<=\[)job=\d{13}(?=\])/g, // /(?<=\[)(job=d{1,13})(?=\])/g,
    });
    const expected = true;

    expect(tested).toEqual(expected);
  });
});
