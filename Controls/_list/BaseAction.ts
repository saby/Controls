import Control = require('Core/Control');
import {Confirmation} from 'Controls/popup';
import {ISelectionObject} from 'Controls/interface';

export default Control.extend({
   validate(items: Array|ISelectionObject): boolean {
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
});
