import Control = require('Core/Control');
import template = require('wml!Controls/_operations/MultiSelector/MultiSelector');


var MultiSelector = Control.extend({
      _template: template,
      _multiSelectStatus: undefined,

      _beforeMount: function(newOptions) {
         this._updateSelection(newOptions.selectedKeys, newOptions.excludedKeys, newOptions.selectedKeysCount, newOptions.isAllSelected);
      },

      _beforeUpdate: function(newOptions) {
         this._updateSelection(newOptions.selectedKeys, newOptions.excludedKeys, newOptions.selectedKeysCount, newOptions.isAllSelected);
      },

      _updateSelection: function(selectedKeys, excludedKeys, count, isAllSelected) {
         const hasSelected = selectedKeys.length;

         if (hasSelected && isAllSelected) {
            this._multiSelectStatus = true;
         } else if (hasSelected && (count > 0 || count === null)) {
            this._multiSelectStatus = null;
         } else {
            this._multiSelectStatus = false;
         }
      },

      _onCheckBoxClick: function() {
         this._notify('selectedTypeChanged', [this._multiSelectStatus === false ? 'selectAll' : 'unselectAll'], {
            bubbling: true
         });
      }
   });

   MultiSelector._theme = ['Controls/operations'];

   export = MultiSelector;

