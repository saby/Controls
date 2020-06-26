import Control = require('Core/Control');
import tmplNotify = require('Controls/Utils/tmplNotify');
import template = require('wml!Controls/_explorer/PathController/PathController');
import {ItemsUtil} from 'Controls/list';
import GridIsEqualUtil = require('Controls/_grid/utils/GridIsEqualUtil');
import HeadingPathBack = require('Controls/_explorer/HeadingPathBack');

   var _private = {
      getHeader: function(self, options, items) {
         var newHeader;

         if (options.header && options.header.length && !options.header[0].title && !options.header[0].template) {
            newHeader = options.header.slice();
            newHeader[0] = {
               ...options.header[0],
               template: HeadingPathBack,
               templateOptions: {
                  itemsAndHeaderPromise: self._itemsAndHeaderPromise,
                  showActionButton: !!options.showActionButton,
                  showArrowOutsideOfBackButton: !!options.showActionButton,
                  backButtonStyle: options.backButtonStyle,
                  backButtonIconStyle: options.backButtonIconStyle,
                  backButtonFontColorStyle: options.backButtonFontColorStyle,
                  displayProperty: options.displayProperty,
                  items
               },

               // TODO: удалить эту опцию после https://online.sbis.ru/opendoc.html?guid=b3647c3e-ac44-489c-958f-12fe6118892f
               isBreadCrumbs: true
            };
         } else {
            newHeader = options.header;
         }
         return newHeader;
      },

      needShadow: function(header, headerCfg) {

         //если есть заголовок, то тень будет под ним, и нам не нужно рисовать ее под хлебными крошками
         return !(header || headerCfg);
      }
   };

   var PathController = Control.extend({
      _template: template,
      _header: null,
      _needShadow: false,
      _lastCrumbId: null,
      _itemsAndHeaderPromiseResolver: null,

      _beforeMount: function(options) {
         this._itemsAndHeaderPromise = new Promise((resolve) => {
            this._itemsAndHeaderPromiseResolver = resolve;
         });
         this._header = _private.getHeader(this, options, options.items);
         options.itemsPromise.then((items) => {
            this._needShadow = _private.needShadow(this._header, options.header);
            this._itemsAndHeaderPromiseResolver({
               items,
               header: this._header
            });
         });
      },

      _beforeUpdate: function(newOptions) {
         if (this._options.rootVisible !== newOptions.rootVisible || newOptions.items !== this._options.items || !GridIsEqualUtil.isEqualWithSkip(this._options.header, newOptions.header, { template: true })) {
            this._itemsAndHeaderPromise = new Promise((resolve) => {
               this._itemsAndHeaderPromiseResolver = resolve;
            });
            this._header = _private.getHeader(this, newOptions, newOptions.items);
            this._itemsAndHeaderPromiseResolver({
               items: newOptions.items,
               header: this._header
            });
            this._needShadow = _private.needShadow(this._header, newOptions.header);
         }
      },

      _notifyHandler: tmplNotify,

      _onBackButtonClick: function(e) {
         const self = this;
         require(['Controls/breadcrumbs'], function (breadcrumbs) {
            breadcrumbs.HeadingPathCommon.onBackButtonClick.call(self, e);
         });

      },

   });
   PathController._private = _private;
   export = PathController;
