import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import * as template from 'wml!Controls/_scroll/ScrollContextProvider';
import ScrollContext from 'Controls/_scroll/Scroll/Context';

interface IOptions extends IControlOptions {
   pagingVisible: boolean;
}

export default class ScrollContextProvider extends Control<IOptions> {
   _template: TemplateFunction = template;
   protected _scrollData: ScrollContext;

   protected _beforeMount(options: IOptions): void {
      this._scrollData = new ScrollContext({
         pagingVisible: options.pagingVisible
      });
   }

   protected _beforeUpdate(newOptions: IOptions): void {
      if (this._options.pagingVisible !== newOptions.pagingVisible) {
         this._scrollData.setPagingVisible(newOptions.pagingVisible);
      }
   }

   _getChildContext(): object {
      return {
         scrollContext: this._scrollData
      };
   }
}
