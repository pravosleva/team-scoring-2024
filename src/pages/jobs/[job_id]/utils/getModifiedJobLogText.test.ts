// import { describe, test, expect } from 'vitest';
import { getModifiedJobLogText } from './getModifiedJobLogText'

/* NOTE: #ERROR_EXAMPLE

Cannot find name 'describe'.
Do you need to install type definitions for a test runner?
Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`
and then add 'jest' or 'mocha' to the types field in your tsconfig.ts(2593)

Ошибка возникает потому, что вы используете Vitest,
а TypeScript по привычке предлагает установить типы для Jest.
В Vitest функции describe, it, test по умолчанию не являются глобальными,
либо TS о них не знает.

Cпособ 1. 
Самый простой способ: Добавить
import { describe, test, expect } from 'vitest';

Способ 2.
Обновить tsconfig.json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
Создать файл vitest-env.d с содержимым:
/// <reference types="vitest/globals" />
Это прямой указатель для компилятора: «в этом файле (или проекте) используй типы глобалов Vitest».

Если вы используете Vite, у вас в корне могут быть tsconfig.json, tsconfig.app.json и tsconfig.node.json
- Посмотрите, какой из них основной
- Попробуйте добавить "types": ["vitest/globals"] в каждый из них (в секцию compilerOptions), чтобы исключить ситуацию, когда один конфиг перекрывает другой.
После изменений в tsconfig.json не забудьте перезагрузить TS Server в VS Code (Ctrl+Shift+P -> TypeScript: Restart TS Server)

Последнее средство (проверка связи):
Попробуйте в самом файле теста в самой первой строке написать:
import { describe, it, expect } from 'vitest';
Если ошибка исчезнет — значит, проблема только в настройке глобалов.
Если ошибка сменится на "Cannot find module 'vitest'" — значит,
пакет vitest не установлен или криво встал в node_modules.

Если ручной импорт import { describe } from 'vitest' убрал ошибку, значит, проблема локализована: пакет vitest установлен корректно, но TypeScript по какой-то причине игнорирует глобальные типы из вашего tsconfig.json.

Иногда «красное подчеркивание» рисует не TypeScript, а ESLint. Если в терминале всё собирается, а в редакторе ошибка, добавьте в настройки ESLint (.eslintrc или eslint.config.js):
// Для старого формата .eslintrc
{
  "env": {
    "vitest/globals": true
  }
}
*/

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
    const expected = 'TEST: The Job';

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
    const expected = 'TEST: The Job 1 // The Job 2 // John Doe';

    expect(tested).toEqual(expected);
  });
});
