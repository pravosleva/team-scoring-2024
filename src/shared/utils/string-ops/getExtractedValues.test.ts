import { getExtractedValues } from './getExtractedValues';

describe('Тестирование получения значения из строки', () => {
  test('case 1: Простой успешный кейс', async () => {
    const testedValue = getExtractedValues({
      tested: ['[days=1]'],
      expectedKey: 'days',
      valueType: 'number',
    });
    const expectedValue = ['1'];
    expect(testedValue).toEqual(expectedValue);
  });

  test('case 2: Простой успешный кейс', async () => {
    const testedValue = getExtractedValues({
      tested: ['[days=11]'],
      expectedKey: 'days',
      valueType: 'number',
    });
    const expectedValue = ['11'];
    expect(testedValue).toEqual(expectedValue);
  });

  test('case 3', async () => {
    const testedValue = getExtractedValues({
      tested: ['[DAYS_LEFT=777]'],
      expectedKey: 'DAYS_LEFT',
      valueType: 'number',
    });
    const expectedValue = ['777'];
    expect(testedValue).toEqual(expectedValue);
  });

  test('case 4', async () => {
    const testedValue = getExtractedValues({
      tested: ['[days-left=11]'],
      expectedKey: 'days-left',
      valueType: 'number',
    });
    const expectedValue = ['11'];
    expect(testedValue).toEqual(expectedValue);
  });

  test('case 5', async () => {
    const testedValue = getExtractedValues({
      tested: ['[days-@-left=11]'],
      expectedKey: 'days-@-left',
      valueType: 'number',
    });
    const expectedValue = ['11'];
    expect(testedValue).toEqual(expectedValue);
  });

  test('case 6', async () => {
    const testedValue = getExtractedValues({
      tested: ['[days-left=11]'],
      expectedKey: 'days-left-impossible',
      valueType: 'number',
    });
    const expectedValue: string[] = [];
    expect(testedValue).toEqual(expectedValue);
  });

  test('case 7', async () => {
    const testedValue = getExtractedValues({
      tested: ['[days-left-impossible=11]'],
      expectedKey: 'days-left',
      valueType: 'number',
    });
    const expectedValue: string[] = [];
    expect(testedValue).toEqual(expectedValue);
  });

  test('case 8', async () => {
    const testedValue = getExtractedValues({
      tested: ['[SPECIAL_MSG=Just a moment, plz]'],
      expectedKey: 'SPECIAL_MSG',
      valueType: 'string',
    });
    const expectedValue: string[] = ['Just a moment, plz'];
    expect(testedValue).toEqual(expectedValue);
  });

  test('case 9', async () => {
    const testedValue = getExtractedValues({
      tested: ['[SPECIAL_MSG=Just a moment, plz]', '[SPECIAL_MSG=message 2]'],
      expectedKey: 'SPECIAL_MSG',
      valueType: 'string',
    });
    const expectedValue: string[] = ['Just a moment, plz', 'message 2'];
    expect(testedValue).toEqual(expectedValue);
  });
});
