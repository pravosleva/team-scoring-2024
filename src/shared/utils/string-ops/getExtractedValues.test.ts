import { getExtractedValues } from './getExtractedValues';

describe('Тестирование получения значения из строки', () => {
  test('case 1: Простой успешный кейс', async () => {
    const testedValue = getExtractedValues({
      tested: ['[days=1]'],
      expectedKey: 'days',
    });
    const expectedValue = ['1'];
    expect(testedValue).toEqual(expectedValue);
  });

  test('case 2: Простой успешный кейс', async () => {
    const testedValue = getExtractedValues({
      tested: ['[days=11]'],
      expectedKey: 'days',
    });
    const expectedValue = ['11'];
    expect(testedValue).toEqual(expectedValue);
  });

  test('case 3', async () => {
    const testedValue = getExtractedValues({
      tested: ['[DAYS_LEFT=777]'],
      expectedKey: 'DAYS_LEFT',
    });
    const expectedValue = ['777'];
    expect(testedValue).toEqual(expectedValue);
  });

  test('case 4', async () => {
    const testedValue = getExtractedValues({
      tested: ['[days-left=11]'],
      expectedKey: 'days-left',
    });
    const expectedValue = ['11'];
    expect(testedValue).toEqual(expectedValue);
  });

  test('case 5', async () => {
    const testedValue = getExtractedValues({
      tested: ['[days-@-left=11]'],
      expectedKey: 'days-@-left',
    });
    const expectedValue = ['11'];
    expect(testedValue).toEqual(expectedValue);
  });

  test('case 6', async () => {
    const testedValue = getExtractedValues({
      tested: ['[days-left=11]'],
      expectedKey: 'days-left-impossible',
    });
    const expectedValue: string[] = [];
    expect(testedValue).toEqual(expectedValue);
  });

  test('case 7', async () => {
    const testedValue = getExtractedValues({
      tested: ['[days-left-impossible=11]'],
      expectedKey: 'days-left',
    });
    const expectedValue: string[] = [];
    expect(testedValue).toEqual(expectedValue);
  });
});
