import {Formatter} from 'Controls/decorator';



      var
         _private = {

            /**
             * Получить данные путем приведения исходного значения в виде разбиения к маске.
             * @param format данные о маске.
             * @param splitValue значения в виде разбиения.
             * @return {
             *    {
             *       value: String значение с разделителями,
             *       positions: Array позиция курсора
             *    }|undefined
             * }
             */
            getDataBySplitValue: function(format, splitValue, replacer, inputType) {
               // TODO: продумать механизм обработки ошибок в форматных полях.
               // https://online.sbis.ru/opendoc.html?guid=3236bcfd-4ae8-4f90-a1c8-7e2caddde339
               try {
                  // TODO: нужен комментарий или удалить код. https://online.sbis.ru/opendoc.html?guid=3236bcfd-4ae8-4f90-a1c8-7e2caddde339
                  if (inputType === 'insert' && replacer) {
                     return Formatter.getFormatterData(format, {
                        value: splitValue.before + splitValue.after,
                        position: splitValue.before.replace(new RegExp(replacer + '*$', 'g'), '').length
                     });
                  } else {
                     return Formatter.getFormatterData(format, {
                        value: splitValue.before + splitValue.after,
                        position: splitValue.before.length
                     });
                  }
               } catch (e) {
                  return false;
               }
            }
         },
         InputProcessor = {

            /**
             * Получить разбиение чистого значения.
             * @param splitValue разбиение исходного значения.
             * @param clearData чистые данные.
             * @return {Object}
             */
            getClearSplitValue: function(splitValue, clearData) {
               var
                  clearSplitValue = {},
                  start = 0, position;

               clearSplitValue.before = clearData.value.substring(start, clearData.positions[splitValue.before.length]);
               start = clearSplitValue.before.length;
               position = splitValue.before.length;

               clearSplitValue.delete = clearData.value.substring(start, clearData.positions[position + splitValue.delete.length]);
               start += clearSplitValue.delete.length;
               position += splitValue.delete.length;

               clearSplitValue.after = clearData.value.substring(start, clearData.positions[position + splitValue.after.length]);

               clearSplitValue.insert = splitValue.insert;

               return clearSplitValue;
            },

            /**
             * Вставка.
             * @param format данные маски.
             * @param clearSplitValue разбиение чистого значения.
             * @param replacer заменитель.
             * @returns {{value: (String) новая строка, position: (Integer) позиция курсора}}
             */
            insert: function(format, clearSplitValue, replacer) {
               var char, oldClearSplitValue, newClearSplitValue, data, result;

               oldClearSplitValue = {
                  before: clearSplitValue.before,
                  after: clearSplitValue.delete.replace(/./g, replacer) + clearSplitValue.after
               };

               // Будем добавлять по 1 символу, потому что вставка должна работать так же как и ввод по 1 символу.
               for (var i = 0; i < clearSplitValue.insert.length; i++) {
                  char = clearSplitValue.insert[i];

                  /**
                   * Если последний символ заменитель, то попытаемся сделать сдвиг.
                   */
                  if (replacer === oldClearSplitValue.after.slice(-1)) {
                     newClearSplitValue = {
                        before: oldClearSplitValue.before + char,
                        after: oldClearSplitValue.after.slice(0, -1)
                     };

                     data = _private.getDataBySplitValue(format, newClearSplitValue, replacer, 'insert');
                  } else {
                     // Добавляем символ без замены следующего.
                     newClearSplitValue = {
                        before: oldClearSplitValue.before + char,
                        after: oldClearSplitValue.after
                     };

                     data = _private.getDataBySplitValue(format, newClearSplitValue, replacer, 'insert');

                     // Если не получилось, то поробуем заменить.
                     if (!data) {
                        newClearSplitValue = {
                           before: oldClearSplitValue.before + char,
                           after: oldClearSplitValue.after.substring(1)
                        };

                        data = _private.getDataBySplitValue(format, newClearSplitValue, replacer, 'insert');
                     }
                  }

                  if (data) {
                     result = data;
                     data = undefined;
                     oldClearSplitValue = newClearSplitValue;
                  }
               }

               return result;
            },

            /**
             * Удаление.
             * @param format данные маски.
             * @param clearSplitValue разбиение чистого значения.
             * @param replacer заменитель.
             * @returns {{value: (String) новая строка, position: (Integer) позиция курсора}}
             */
            delete: function(format, clearSplitValue, replacer) {
               return _private.getDataBySplitValue(format, {
                  before: clearSplitValue.before,
                  after: clearSplitValue.delete.replace(/./g, replacer) + clearSplitValue.after
               }, replacer, 'delete');
            },

            /**
             * Удаление через delete.
             * @param format данные маски.
             * @param clearSplitValue разбиение чистого значения.
             * @param replacer заменитель.
             * @returns {{value: (String) новая строка, position: (Integer) позиция курсора}}
             */
            deleteForward: function(format, clearSplitValue, replacer) {
               var newClearSplitValue;

               if (clearSplitValue.delete) {
                  newClearSplitValue = {
                     before: clearSplitValue.before + replacer,
                     after: clearSplitValue.after
                  };
               } else {
                  newClearSplitValue = {
                     before: clearSplitValue.before + replacer,
                     after: clearSplitValue.after.substring(1)
                  };
               }

               return _private.getDataBySplitValue(format, newClearSplitValue, replacer, 'deleteForward');
            },

            /**
             * Удаление через backspace.
             * @param format данные маски.
             * @param clearSplitValue разбиение чистого значения.
             * @param replacer заменитель.
             * @returns {{value: (String) новая строка, position: (Integer) позиция курсора}}
             */
            deleteBackward: function(format, clearSplitValue, replacer) {
               var newClearSplitValue;

               if (clearSplitValue.delete) {
                  newClearSplitValue = {
                     before: clearSplitValue.before,
                     after: replacer + clearSplitValue.after
                  };
               } else {
                  newClearSplitValue = {
                     before: clearSplitValue.before.slice(0, -1),
                     after: replacer + clearSplitValue.after
                  };
               }

               return _private.getDataBySplitValue(format, newClearSplitValue, replacer, 'deleteBackward');
            },

            /**
             * Ввод.
             * @param splitValue значение разбитое на части before, insert, after, delete.
             * @param inputType тип ввода.
             * @param replacer заменитель.
             * @param oldFormat данные маски, на которую проецировалось разбитое значение.
             * @param newFormat данные маски, на которую будет проецироваться разбитое значение.
             * @return {{value: (String) новая строка, position: (Integer) позиция курсора}}
             */
            input: function(splitValue, inputType, replacer, oldFormat, newFormat) {
               var value = splitValue.before + splitValue.delete + splitValue.after;
               var clearData = Formatter.getClearData(oldFormat, value);
               var clearSplitValue = InputProcessor.getClearSplitValue(splitValue, clearData);
               var result;

               switch (inputType) {
                  case 'insert':
                     result = InputProcessor.insert(newFormat, clearSplitValue, replacer);
                     break;
                  case 'delete':
                     result = InputProcessor.delete(newFormat, clearSplitValue, replacer);
                     break;
                  case 'deleteForward':
                     result = InputProcessor.deleteForward(newFormat, clearSplitValue, replacer);
                     break;
                  case 'deleteBackward':
                     result = InputProcessor.deleteBackward(newFormat, clearSplitValue, replacer);
                     break;
               }

               // Result is undefined when input was invalid
               if (result) {
                  result.format = newFormat;
               } else {
                  // Return old value
                  result = {
                     value: value,
                     position: splitValue.before.length + splitValue.delete.length,
                     format: oldFormat
                  };
               }

               return result;
            }
         };

      InputProcessor._private = _private;

      export = InputProcessor;

