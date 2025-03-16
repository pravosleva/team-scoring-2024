import { getModifiedJobLogText } from './getModifiedJobLogText'

describe('Тестирование регулярок', () => {
  test('case 1', () => {
    const tested = getModifiedJobLogText({
      text: 'TEST: [job=1234567890123]',
      jobs: [
        {
          id: 1234567890123,
          title: 'The Job',
          descr: 'descr',
          completed: false,
          forecast: {
            complexity: 0,
          },
          ts: {
            create: 1,
            update: 1,
          },
          logs: {
            limit: 1,
            isEnabled: false,
            items: [],
          },
        }
      ],
      users: [
        {
          id: 1,
          ts: {
            create: 1,
            update: 1,
          },
          displayName: 'John Doe',
        }
      ],
    });
    const expected = 'TEST: [The Job]';

    expect(tested).toEqual(expected);
  });

  test('case 2', () => {
    const tested = getModifiedJobLogText({
      text: 'TEST: [job=1234567890123] // [job=1234567890124] // [user=1234567890777]',
      jobs: [
        {
          id: 1234567890123,
          title: 'The Job 1',
          descr: 'descr',
          completed: false,
          forecast: {
            complexity: 0,
          },
          ts: {
            create: 1,
            update: 1,
          },
          logs: {
            limit: 1,
            isEnabled: false,
            items: [],
          },
        },
        {
          id: 1234567890124,
          title: 'The Job 2',
          descr: 'descr',
          completed: false,
          forecast: {
            complexity: 0,
          },
          ts: {
            create: 1,
            update: 1,
          },
          logs: {
            limit: 1,
            isEnabled: false,
            items: [],
          },
        }
      ],
      users: [
        {
          id: 1234567890777,
          ts: {
            create: 1,
            update: 1,
          },
          displayName: 'John Doe',
        }
      ],
    });
    const expected = 'TEST: [The Job 1] // [The Job 2] // [John Doe]';

    expect(tested).toEqual(expected);
  });
});
