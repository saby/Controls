import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Suggest_new/Input/SuggestTemplate/resources/SuggestTemplateGrid');
import headerTemplate = require('wml!Controls-demo/Suggest_new/Input/SuggestTemplate/resources/HeaderTemplate');

class SuggestTemplateGrid extends Control{
   protected _template: TemplateFunction = controlTemplate;
   protected _columns: object[] = null;

   _beforeMount(): void {
      this._columns = [
         {
            displayProperty: 'title'
         }, {
            displayProperty: 'owner'
         }
      ];
      this._header = [
       {
         title: 'Отдел',
         align: 'center',
         template: headerTemplate
      }, {
         title: 'Руководитель',
         align: 'center',
         template: headerTemplate
      }];
   }
}
export default SuggestTemplateGrid;
