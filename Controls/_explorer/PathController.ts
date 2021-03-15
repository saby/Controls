import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_explorer/PathController/PathController';
import {EventUtils} from 'UI/Events';
import HeadingPathBack from 'Controls/_explorer/HeadingPathBack';
import * as GridIsEqualUtil from 'Controls/Utils/GridIsEqualUtil';

export default class PathController extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;
   protected _header: object;
   protected _needShadow: boolean = false;
   private _itemsAndHeaderPromise: Promise<object>;
   private _itemsAndHeaderPromiseResolver: (result: object) => void;

   protected _notifyHandler: EventUtils.tmplNotify = EventUtils.tmplNotify;

   protected _beforeMount(options) {
      this._prepareHeader({}, options);
      options.itemsPromise.then((items) => {
         this._needShadow = this._isNeedShadow(this._header, options.header);
         this._resolveItemsAndHeaderPromise(items);
      });
   }

   protected _beforeUpdate(newOptions) {
      this._prepareHeader(this._options, newOptions);
      this._resolveItemsAndHeaderPromise(newOptions.items);
      this._needShadow = this._isNeedShadow(this._header, newOptions.header);
   }

   protected _onBackButtonClick(e): void {
      require(['Controls/breadcrumbs'], (breadcrumbs) => {
         breadcrumbs.HeadingPathCommon.onBackButtonClick.call(this, e);
      });
   }

   private _prepareHeader(oldOptions, newOptions): void {
      const isEqualItems = (oldItems, newItems) => {
         if ((!oldItems && newItems) || (oldItems && !newItems)) { return false }
         if (!oldItems && !newItems) { return true }

         return oldItems.length === newItems.length && oldItems.reduce((acc, prev, index) => acc && prev.isEqual(newItems[index]), true);
      };

      if (
          oldOptions.rootVisible !== newOptions.rootVisible ||
          !isEqualItems(oldOptions.items, newOptions.items) ||
          !GridIsEqualUtil.isEqualWithSkip(oldOptions.header, newOptions.header, {template: true})
      ) {
         this._itemsAndHeaderPromise = new Promise((resolve) => {
            this._itemsAndHeaderPromiseResolver = resolve;
         });

         this._header = null;
      }

      if (!this._header) {
         let newHeader;

         if (newOptions.header && newOptions.header.length && !(newOptions.header[0].title || newOptions.header[0].caption) && !newOptions.header[0].template) {
            newHeader = newOptions.header.slice();
            newHeader[0] = {
               ...newOptions.header[0],
               template: HeadingPathBack,
               templateOptions: {
                  itemsAndHeaderPromise: this._itemsAndHeaderPromise,
                  showActionButton: !!newOptions.showActionButton,
                  showArrowOutsideOfBackButton: !!newOptions.showActionButton,
                  backButtonStyle: newOptions.backButtonStyle,
                  backButtonIconStyle: newOptions.backButtonIconStyle,
                  backButtonFontColorStyle: newOptions.backButtonFontColorStyle,
                  displayProperty: newOptions.displayProperty,
                  items: newOptions.items
               },

               // TODO: удалить эту опцию после https://online.sbis.ru/opendoc.html?guid=b3647c3e-ac44-489c-958f-12fe6118892f
               isBreadCrumbs: true
            };
         } else {
            newHeader = newOptions.header;
         }

         this._header = newHeader;
      }
   }

   private _resolveItemsAndHeaderPromise(items): void {
      if (this._itemsAndHeaderPromiseResolver) {
         this._itemsAndHeaderPromiseResolver({
            items: items,
            header: this._header
         });
         this._itemsAndHeaderPromiseResolver = null;
      }
   }

   private _isNeedShadow(header, headerCfg): boolean {
      // если есть заголовок, то тень будет под ним, и нам не нужно рисовать ее под хлебными крошками
      return !(header || headerCfg);
   }
}
