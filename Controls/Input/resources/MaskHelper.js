define('Controls/Input/resources/MaskHelper',
   [
      'Controls/Input/resources/MaskDataHelper'
   ],
   function(MaskDataHelper) {

      'use strict';

      var _private = {
         /**
          * Получить разбиение исходного значения, на группы.
          * Разбиение будет найденно, только в том случае, если значение полностью подходит маске.
          * @param maskData данные маски, которой подходит исходное значение.
          * @param value исходное значение.
          * @return Array.<String|undefined> группы.
          */
         getValueGroups: function(maskData, value) {
            var match = value.match(maskData.searchingGroups);

            if (match && match[0].length === match.input.length) {
               return match.filter(function(item, index) {
                  return index > 0;
               });
            }
         }
      };

      var MaskHelper = {
         /**
          * Получить чистые данные.
          * Чистыми данными будем называть: значение без разделителей(чистое) и массив для сопоставления
          * позиций символов исходного значения и символов чистого значение.
          * @param {Object} maskData данные о маске.
          * @param {String} value значение с разделителями.
          * @return {{value: String чистое значение, positions: Array позиция символов исходного значения в чистом значении}}.
          */
         getClearData: function(maskData, value) {
            var
               position = 0,
               positions = [],
               clearValue = '',
               groups = _private.getValueGroups(maskData, value),
               charIterator;

            groups.forEach(function(group, groupIndex) {
               if (group) {
                  if (groupIndex in maskData.delimiterGroups) {
                     for (charIterator = 0; charIterator < group.length; charIterator++) {
                        positions.push(position);
                     }
                  } else {
                     clearValue += group;
                     for (charIterator = 0; charIterator < group.length; charIterator++) {
                        positions.push(position);
                        position++;
                     }
                  }
               }
            });

            return {
               value: clearValue,
               positions: positions
            };
         },

         /**
          * Получить данные путем приведения исходного значения к маске.
          * @param maskData данные о маске.
          * @param clearData чистые данные. Значение без разделителей и позиция курсора.
          * @return {
          *    {
          *       value: String значение с разделителями,
          *       positions: Array позиция курсора
          *    }|undefined
          * }
          */
         getData: function(maskData, clearData) {
            var
               value = '',
               pairs = {},
               position = 0,
               delimiters = '',
               stopConcatenation = false,
               clearPosition = clearData.position,
               groups = _private.getValueGroups(maskData, clearData.value),
               pairPosition, every;

            // Определяем значение и позицию с разделителями, через сцепление групп.
            every = groups && groups.every(function(group, groupIndex) {
               if (stopConcatenation) {
                  return true;
               }

               if (groupIndex in maskData.delimiterGroups) {
                  // Если в очищенные данные попал разделитель, то ничего не получилось.
                  if (group) {
                     return false;
                  }

                  // Группа разделителей.
                  group = maskData.delimiterGroups[groupIndex].value;

                  switch(maskData.delimiterGroups[groupIndex].type) {
                     case 'single':
                        // Первая группа одиночных разделителей в маске должна быть добавлена к данным.
                        if (groupIndex === 0) {
                           value += group;
                           position += group.length;
                        } else {
                           delimiters += group;
                        }
                        break;
                     case 'pair':
                        if (maskData.delimiterGroups[groupIndex].subtype === 'open') {
                           if (!pairs[maskData.delimiterGroups[groupIndex].pair]) {
                              pairs[maskData.delimiterGroups[groupIndex].pair] = [];
                           }
                           pairs[maskData.delimiterGroups[groupIndex].pair].push(value.length + delimiters.length);
                        } else {
                           pairPosition = pairs[group].pop();
                           // Добавляем открывающий разделитель.
                           value = value.substring(0, pairPosition) + maskData.delimiterGroups[groupIndex].pair + value.substring(pairPosition);
                           position += pairPosition <= position;
                           // Добавляем закрывающий разделитель.
                           value += group;
                           position += value.length - position === 1;
                        }
                        break;
                  }
               } else if (group) {
                  value += delimiters + group;
                  if (clearPosition > 0) {
                     position += delimiters.length;
                     position += clearPosition > group.length ? group.length : clearPosition;
                     clearPosition -= group.length;
                  }
                  delimiters = '';
               } else {
                  // Прекратим сцеплять группы, когда будет отсутствовать одна из групп.
                  stopConcatenation = true;
               }

               return true;
            });

            return every && {
               value: value,
               position: position
            };
         }
      };

      MaskHelper._private = _private;

      return MaskHelper;
   }
);