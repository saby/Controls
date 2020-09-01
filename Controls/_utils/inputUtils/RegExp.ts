const WORD_BOUNDARY = '^|[^\\wа-я]|$';
const SPECIAL_CHARS = /[$^*+?.(){}[\]\\|]/g;

/**
 * $1 - Minus.
 * $2 - Integer part.
 * $3 - The separator of the integer and fractional parts.
 * $4 - Fractional part.
 */
export const partOfNumber: RegExp =  /(-?)([0-9]*)([.,]?)([0-9]*)/;

/**
 * Escaping special characters of a regular expression.
 * @param original Escaping value.
 * @return Escaped value.
 */
export function escapeSpecialChars(original: string): string {
   return original.replace(SPECIAL_CHARS, '\\$&');
}

/**
 * Добавить к строке регулярного выражения проверку, является ли строка словом.
 * @remark
 * Работает для алфавитов, основанных на кириллице и латинице.
 *
 * Для таких проверок существует специальный символ \b(@{link https://learn.javascript.ru/regexp-boundary граница слова}.
 * Граница слова \b не работает для алфавитов, не основанных на латинице. Метод имитирует его работу, но с поддержкой
 * кириллицы.
 *
 * @param original строка регулярного выражения.
 * @param flags влаги регулярного выражения.
 * @return Регулярное выражение с проверкой, является ли исходная строка словом.
 */
export function addWordCheck(original: string, flags: string): RegExp {
   const result = `(${WORD_BOUNDARY})(?:${original})(${WORD_BOUNDARY})`;
   const resultRegExp = new RegExp(result, flags);
   const originalExec = resultRegExp.exec;
   resultRegExp.exec = (str) => {
      const originalExecResult = originalExec.call(resultRegExp, str);

      if (originalExecResult === null) {
         return null;
      }

      let found = Array.prototype.shift.call(originalExecResult);

      /**
       * При поиске в массив результатов войдут разделители слов (пробел, запятая и т.д.).
       * С их помощью определяется является ли строка словом. Например, при поиске "мир" в "Привет, мир!" с использованием \b,
       * будет найдено " мир!". При использовании \b он не является разделителем слов, а является началом и концом слова,
       * поэтому не имеет символьного представления. Для имитации работы \b, удаляем границы из набора результатов.
       */
      const startBorder = Array.prototype.shift.call(originalExecResult);
      found = found.replace(new RegExp(`^${escapeSpecialChars(startBorder)}`), '');
      const endBorder = Array.prototype.pop.call(originalExecResult);
      found = found.replace(new RegExp(`${escapeSpecialChars(endBorder)}$`), '');

      originalExecResult.input = found;
      originalExecResult.index += startBorder.length;
      originalExecResult.lastIndex -= endBorder.length;
      Array.prototype.unshift.call(originalExecResult, found);

      return originalExecResult;
   };

   return resultRegExp;
}
