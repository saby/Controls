import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_explorer/PathController/HeadingPathBack';
import {calculatePath} from 'Controls/dataSource';

export default class HeadingPathBack extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;
   protected _headingPathBackOptions: object;
   protected _needHeadingPathBack: boolean;

   protected _beforeMount(options): Promise<void> {
      return options.itemsAndHeaderPromise.then(({ items }) => {
         this._needHeadingPathBack = !!items;
         if (this._needHeadingPathBack) {
            this._headingPathBackOptions = {
               ...options,
               counterCaption: items[items.length - 1].get('counterCaption'),
               backButtonClass: 'controls-BreadCrumbsPath__backButton__wrapper_inHeader',
               backButtonCaption: calculatePath(items, options.displayProperty).backButtonCaption
            };
         }
      });
   }

   protected _beforeUpdate(newOptions): void {
      if (newOptions.items !== this._options.items) {
         this._needHeadingPathBack = !!newOptions.items;
         if (this._needHeadingPathBack) {
            this._headingPathBackOptions = {
               ...newOptions,
               counterCaption: newOptions.items[newOptions.items.length - 1].get('counterCaption'),
               backButtonClass: 'controls-BreadCrumbsPath__backButton__wrapper_inHeader',
               backButtonCaption: calculatePath(newOptions.items, newOptions.displayProperty).backButtonCaption
            };
         }
      }
   }
}
