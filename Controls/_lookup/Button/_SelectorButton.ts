import Control = require('Core/Control');
import template = require('wml!Controls/_lookup/Button/_SelectorButton');
import itemTemplate = require('wml!Controls/_lookup/Button/itemTemplate');
import rk = require('i18n!Controls');
import {List} from 'Types/collection';


   var SelectorButton = Control.extend({
      _template: template,

      _open: function() {
         this._notify('showSelector');
      },

      _reset: function() {
         this._notify('updateItems', [new List()]);
      },

      _crossClick: function(event, item) {
         this._notify('removeItem', [item]);
      },

      _itemClickHandler: function(event, item) {
         this._notify('itemClick', [item]);

         if (!this._options.readOnly && !this._options.multiSelect) {
            this._open();
         }
      },

      _openInfoBox: function(event, config) {
         config.width = this._container.offsetWidth;
      }
   });

   SelectorButton._theme = ['Controls/lookup'];
   SelectorButton.getDefaultOptions = function() {
      return {
         fontColorStyle: 'link',
         buttonStyle: 'secondary',
         maxVisibleItems: 7,
         itemTemplate: itemTemplate,
         showSelectorCaption: `+${rk('еще')}`
      };
   };

   export = SelectorButton;

