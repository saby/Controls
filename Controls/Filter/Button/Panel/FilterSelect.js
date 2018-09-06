define('Controls/Filter/Button/Panel/FilterSelect', [
   'Core/Control',
   'WS.Data/Utils',
   'wml!Controls/Filter/Button/Panel/FilterSelect/FilterSelect'
], function(Control, Utils, template) {

   'use strict';

   var FilterSelect = Control.extend({
      _template: template,

      _clickHandler: function(event, item) {
         this._notify('textValueChanged', [Utils.getItemPropertyValue(item, 'value')]);
         this._notify('valueChanged', [[Utils.getItemPropertyValue(item, this._options.keyProperty)]]);
      }

   });

   return FilterSelect;

});
