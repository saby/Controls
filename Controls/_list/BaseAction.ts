import rk = require('i18n!Controls');
import {Confirmation} from 'Controls/popup';
import {ISelectionObject} from 'Controls/interface';
import {Control, IControlOptions} from 'UI/Base';

/**
 * Базовый класс action'a, на основе которого создаются другие action'ы. Не подходит для самостоятельного использования.
 *
 * @class Controls/_list/BaseAction
 * @extends Core/Control
 * @control
 * @public
 * @author Герасимов А.М.
 */

export default class BaseAction extends Control<IControlOptions> {
   /**
    * Производит проверку переданных параметров. Если массив значений пуст, возвращает false и выводит окно с текстом, иначе возвращает true.
    *
    * @remark
    * При необходимости метод нужно вызывать вручную из наследника.
    *
    * @function
    * @name Controls/_list/BaseAction#validate
    */
   validate(items: unknown[]|ISelectionObject): boolean {
      let resultValidate: boolean = true;

      if (items instanceof Array && !items.length || items.selected && !items.selected.length) {
         resultValidate = false;
         Confirmation.openPopup({
            type: 'ok',
            message: rk('Нет записей для обработки команды')
         });
      }

      return resultValidate;
   }
}
