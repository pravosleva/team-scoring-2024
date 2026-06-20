import { describe, test, expect } from 'vitest';
import { getTextProgressbar } from './getTextProgressbar';

describe('getTextProgressbar', () => {
  test('case 1: 1/10 (10%) с длиной бара 10', () => {
    const tested = getTextProgressbar({
      postfix: 'Done',
      barLength: 10,
      counters: {
        total: 10,
        done: 1,
      },
    });
    const expected = `█░░░░░░░░░ 10% Done (1/10)`;

    expect(tested).toEqual(expected);
  });

  test('case 2: 41/54 (~76%) с длиной бара 15', () => {
    const tested = getTextProgressbar({
      postfix: 'Done',
      barLength: 15,
      counters: {
        total: 54,
        done: 41,
      },
    });
    // 41/54 = 75.92% -> округляется до 76%
    // 15 * 0.76 = 11.4 -> округляется до 11 символов '█'
    const expected = `███████████░░░░ 76% Done (41/54)`;

    expect(tested).toEqual(expected);
  });

  test('case 3: крайний случай с total = 0', () => {
    const tested = getTextProgressbar({
      postfix: 'Done',
      barLength: 10,
      counters: {
        total: 0,
        done: 0,
      },
    });
    const expected = `░░░░░░░░░░ 0% Done`;

    expect(tested).toEqual(expected);
  });
});
