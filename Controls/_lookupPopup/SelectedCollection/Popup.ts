import {Control} from 'UI/Base';
import template = require('wml!Controls/_lookupPopup/SelectedCollection/Popup');

/**
 *
 * Показывает коллекцию элементов в две колонки в всплывающем окне.
 * Используется в Controls/lookup:Input, Controls/lookup:Button
 *
 * @class Controls/_lookupPopup/SelectedCollection/Popup
 * @extends UI/Base:Control
 * @mixes Controls/_lookup/SelectedCollection/SelectedCollectionStyles
 * 
 * @public
 * @author Крайнов Д.О.
 */

/*
 *
 * Shows a collection of items with delete button in two columns.
 * Used in Controls/lookup:Input, Controls/lookup:Button
 *
 * @class Controls/_lookupPopup/SelectedCollection/Popup
 * @extends UI/Base:Control
 * @mixes Controls/_lookup/SelectedCollection/SelectedCollectionStyles
 * 
 * @public
 * @author Крайнов Д.О.
 */

      var itemHiddenTemplate = Control.extend({
         _template: template,

         _beforeMount: function(options) {
            // Clone in order to delete items from the list when clicking on the cross.
            this._items = options.items.clone();
         },

         _itemClick: function(event, item) {
            this._options.clickCallback('itemClick', item);
            this._notify('close', [], {bubbling: true});
         },

         _crossClick: function(event, item) {
            this._items.remove(item);
            this._options.clickCallback('crossClick', item);
         }
      });

      itemHiddenTemplate._theme = ['Controls/lookup', 'Controls/popup'];

      export = itemHiddenTemplate;

