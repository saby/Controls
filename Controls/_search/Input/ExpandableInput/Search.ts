import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls/_search/Input/ExpandableInput/Search');
import {EventUtils} from 'UI/Events';
import {ITextOptions, IBaseOptions} from 'Controls/input';
import {IRenderOptions, IPaddingOptions, ITagOptions} from 'Controls/interface';
import 'css!Controls/search';

interface IExpandableInputOptions extends IBaseOptions, ITextOptions,
    IRenderOptions, IPaddingOptions, ITagOptions {
   inlineWidth?: string;
   expanded?: boolean;
}
/**
 * Контрол "Разворачиваемый поиск". Является однострочным полем ввода. Контрол используют в реестрах для ввода поискового запроса.
 *
 * @class Controls/_search/Input/ExpandableInput/Search
 * @extends UI/Base:Control
 * @mixes Controls/search:Input
 * @public
 * @demo Controls-demo/Search/ExpandableInput/Index
 * @author Мельникова Е.А.
 */

export default class ExpandableInput extends Control<IControlOptions> {
   protected _expanded: boolean = false;
   protected _template: TemplateFunction = template;
   protected _tmplNotify: Function = EventUtils.tmplNotify;
   protected _needShowAnimation: boolean = false;

   protected _beforeMount(options: IExpandableInputOptions): void {
      this._expanded = this._getExpanded(options.expanded);
   }

   protected _animationendHandler(): void {
      this._needShowAnimation = false;
   }

   private _getExpanded(expanedOption?: boolean): boolean {
      return typeof expanedOption !== 'undefined' ? expanedOption : this._expanded;
   }

   protected _afterUpdate(): void {
      if (this._expanded) {
         this._children.searchInput.activate({enableScreenKeyboard: true});
      }
   }

   protected _handleOpenClick(): void {
      this._expanded = true;
      this._needShowAnimation = true;
   }

   protected _handleCloseClick(): void {
      this._expanded = false;
      this._needShowAnimation = true;
      this._notify('valueChanged', ['']);
   }

   static getDefaultOptions(): object {
      return {
         inlineWidth: 'm',
         expanded: false
      };
   }
}
/**
 * @name Controls/_search/Input/ExpandableInput/Search#expanded
 * @cfg {Boolean} Устанавливает состояние развернутости строки поиска.
 * @variant false Строка поиска свернута.
 * @variant true Строка поиска развернута.
 * @default false
 */

/**
 * @name Controls/_search/Input/ExpandableInput/Search#inlineWidth
 * @cfg {String} Устанавливает значение ширины строки поиска.
 * @variant m Строка поиска средней ширины.
 * @variant l Строка поиска большой ширины.
 * @default m
 */

Object.defineProperty(ExpandableInput, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return ExpandableInput.getDefaultOptions();
   }
});
