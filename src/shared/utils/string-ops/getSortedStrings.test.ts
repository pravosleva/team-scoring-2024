import { describe, test, expect } from 'vitest';
import { getSortedStrings } from './getSortedStrings';

describe('Тестирование регулярок', () => {
  test('case 1: Соответствие строки: ok', () => {
    const tested = getSortedStrings({
      items: ['a', 'b'],
      order: 'ASC',
    });
    const expected = ['a', 'b'];

    expect(tested).toEqual(expected);
  });
});
