import Base from './Base';
import {Logger} from 'UI/Utils';

/**
 * Шаблон редактирования даты и времени.
 * Используется при редактировании по месту в полях ввода, о чем подробнее читайте <a href="/doc/platform/developmentapl/interface-development/controls/input/edit/">здесь</a>.
 * @class Controls/_editableArea/Templates/Editors/DateTime
 * @extends Controls/editableArea:Base
 * @public
 * @author Красильников А.С.
 * @see @class Controls/_editableArea/Templates/Editors/Base
 * @demo Controls-demo/EditableArea/ViewContent/Index
 */

class DateTime extends Base {
   _prepareValueForEditor(value): string {
      let date = value;
      if (!date) {
          date = new Date();
          Logger.warn('DateTime: Option "value" cannot be empty');
      }
      // todo fixed by: https://online.sbis.ru/opendoc.html?guid=00a8daf1-c567-46bb-a40e-53c1eef5a26b
      return date.toLocaleDateString('ru-RU', {
         year: '2-digit',
         month: 'numeric',
         day: 'numeric'
      });
   }
}

export default DateTime;
