import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_compatiblePopup/OldNotification/OldNotification');
import 'css!Controls/compatiblePopup';

export default class OldNotification extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;

   protected _afterMount(): void {
      this._options.waitCallback();
   }
   protected _close(): void {
      // После правок https://online.sbis.ru/opendoc.html?guid=5011523a-1e97-4e5b-be95-ed5c56b854b8 парент есть всегда
      if (this.getParent) {
         this.getParent().close();
      }
   }
}