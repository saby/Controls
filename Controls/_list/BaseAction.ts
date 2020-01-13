import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Confirmation} from 'Controls/popup';
import {ISelectionObject} from 'Controls/interface';

export default class BaseAction extends Control<IControlOptions> {
   validate(items: Array|ISelectionObject): boolean {
      let resultValidate: boolean = true;

      if (items instanceof Array && !items.length || items.selected && !items.selected.length) {
         resultValidate = false;
         Confirmation.openPopup({
            type: 'ok',
            message: rk('Нет записей для обработки команды'),
            style: 'danger'
         });
      }

      return resultValidate;
   }
}
