import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_explorer/PathController/PathWrapper';
import {EventUtils} from 'UI/Events';
import * as GridIsEqualUtil from 'Controls/Utils/GridIsEqualUtil';

export default class PathWrapper extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;
   protected _needCrumbs: boolean = false;
   protected _withoutBackButton: boolean = false;
   protected _items: object[];
   private _header: object;

   protected _notifyHandler: EventUtils.tmplNotify = EventUtils.tmplNotify;

   protected _beforeMount(options): Promise<void> {
      return options.itemsAndHeaderPromise.then((params) => {
         this._items = params.items;
         this._needCrumbs = this._isNeedCrumbs(params.header, params.items, options);
         this._header = params.header;
         this._withoutBackButton = this._isWithoutBackButton(this._header);
      });
   }

   protected _beforeUpdate(newOptions): void {
      const isEqualsHeader = GridIsEqualUtil.isEqualWithSkip(
          this._header,
          newOptions.header,
          { template: true }
       );

      if (this._items !== newOptions.items ||
          this._options.rootVisible !== newOptions.rootVisible || !isEqualsHeader) {
         this._items = newOptions.items;
         this._needCrumbs = this._isNeedCrumbs(newOptions.header,  this._items, newOptions);
      }

      if (this._options.breadcrumbsVisibility !== newOptions.breadcrumbsVisibility) {
         this._needCrumbs = _private.needCrumbs(newOptions.header,  this._items, newOptions);
      }

      if (!isEqualsHeader) {
         this._header = newOptions.header;
         this._withoutBackButton = this._isWithoutBackButton(this._header);
      }
   }

   private _isNeedCrumbs(header, items, options): boolean {
      if (options.breadcrumbsVisibility === 'hidden') {
         return false;
      }

      return !!items &&
          ((!this._isWithoutBackButton(header) && items.length > 0) || items.length > 1) ||
          !!options.rootVisible;
   }

   private _isWithoutBackButton(header): boolean {
      return !!(header && header[0] && header[0].isBreadCrumbs);
   }
}
