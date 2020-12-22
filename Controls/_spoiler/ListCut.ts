import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {INavigation} from 'Controls/interface';
import {IExpandable, IExpandableOptions} from 'Controls/interface';
import {IIconSize, IIconSizeOptions} from 'Controls/interface';
import * as template from 'wml!Controls/_spoiler/ListCut/ListCut';

/**
 * Интерфейс для опций контрола, который позволяет сворачивать/разворачивать список с помощью параметров навигации.
 * @interface Controls/_spoiler/IListCut
 * @private
 * @author Красильников А.С.
 */

export interface IListCutOptions extends IControlOptions, IExpandableOptions, IIconSizeOptions {
   /**
    * Навигация при свернутом списке.
    * @see collapsedNavigation
    * @demo Controls-demo/Spoiler/ListCut/Index
    */
   expandedNavigation: INavigation;
   /**
    * Навигация при развернутом списке.
    * @see expandedNavigation
    * @demo Controls-demo/Spoiler/ListCut/Index
    */
   collapsedNavigation: INavigation;
}

/**
 * Графический контрол, который позволяет сворачивать/разворачивать список с помощью параметров навигации.
 * @remark Желательно использовать вместо скролл-контейнера для списков без бесконечного скролла.
 *
 * @class Controls/_spoiler/ListCut
 * @extends UI/Base:Control
 * @implements Controls/interface:IExpandable
 * @implements Controls/interface:IIconSize
 * @implements Controls/spoiler:IListCutOptions
 * @private
 * @demo Controls-demo/Spoiler/ListCut/Index
 *
 * @author Красильников А.С.
 */

export default class ListCut extends Control<IListCutOptions> implements IExpandable, IIconSize {
   protected _template: TemplateFunction = template;
   protected _expanded: boolean;

   readonly '[Controls/_toggle/interface/IExpandable]': boolean = true;
   readonly '[Controls/_interface/IIconSize]': boolean;

   protected _beforeUpdate(options?: IListCutOptions): void {
      if (options.hasOwnProperty('expanded') && this._options.expanded !== options.expanded) {
         this._expanded = options.expanded;
      }
   }

   protected _clickHandler(): void {
      const expanded = !this._expanded;
      if (this._options.readOnly) {
         return;
      } else if (!this._options.hasOwnProperty('expanded')) {
         this._expanded = expanded;
      }

      this._notify('expandedChanged', [expanded]);
   }

   static _theme: string[] = ['Controls/Classes', 'Controls/spoiler'];

   static getDefaultOptions(): object {
      return {
         separatorSize: 'm'
      };
   }
}
