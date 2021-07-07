import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Suggest_new/SearchInput/ItemActions/resources/SuggestTemplate');

class SuggestTemplate extends Control{
   protected _template: TemplateFunction = controlTemplate;
   protected _itemActions: object[];
   protected _beforeMount(): void {
      this._itemActions = [
         {
            id: 1,
            icon: 'icon-PhoneNull',
            title: 'phone'
         },
         {
            id: 2,
            icon: 'icon-EmptyMessage',
            title: 'message',
            parent: null,
            'parent@': true
         },
         {
            id: 6,
            title: 'call',
            parent: 2,
            'parent@': null
         },
         {
            id: 4,
            icon: 'icon-Erase',
            iconStyle: 'danger',
            title: 'delete pls',
            showType: 2
         }
      ];
   }
}
export default SuggestTemplate;
