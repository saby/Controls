import {calculatePath, Path} from 'Controls/dataSource';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls/_explorer/PathController/HeadingPathBack';

interface IOptions extends IControlOptions {
   items: Path;
   displayProperty: string;
}

export default class HeadingPathBack extends Control<IOptions> {
   protected _template: TemplateFunction = template;
   protected _headingPathBackOptions: object;
   protected _needHeadingPathBack: boolean;

   protected _beforeMount(options: IOptions): void {
      this._updateState(options);
   }

   protected _beforeUpdate(newOptions: IOptions): void {
      if (
          newOptions.items !== this._options.items ||
          newOptions.displayProperty !== this._options.displayProperty
      ) {
         this._updateState(newOptions);
      }
   }

   private _updateState(options: IOptions): void {
      const items = options.items;

      this._needHeadingPathBack = !!items;
      if (this._needHeadingPathBack) {
         this._headingPathBackOptions = {
            ...options,
            counterCaption: items[items.length - 1].get('counterCaption'),
            backButtonClass: 'controls-BreadCrumbsPath__backButton__wrapper_inHeader',
            backButtonCaption: calculatePath(items, options.displayProperty).backButtonCaption
         };
      }
   }
}
