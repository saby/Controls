import Base from './Base';

/**
 * @class Controls/_editableArea/Templates/Editors/DateTime
 * @public
 * @author Авраменко А.С.
 */

class DateTime extends Base {
   _prepareValueForEditor(value): string {
      // todo fixed by: https://online.sbis.ru/opendoc.html?guid=00a8daf1-c567-46bb-a40e-53c1eef5a26b
      return value.toLocaleDateString('ru-RU', {
         year: '2-digit',
         month: 'numeric',
         day: 'numeric'
      });
   }
}

export default DateTime;
