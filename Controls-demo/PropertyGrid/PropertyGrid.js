define('Controls-demo/PropertyGrid/PropertyGrid',
   [
      'UI/Base',
      'wml!Controls-demo/PropertyGrid/PropertyGrid'
   ],
   function (
      BaseMod, template
   ) {
      'use strict';
      var PropertyGrid = BaseMod.Control.extend({
         _template: template,
         _validationErrorsHandler: function (event, tmp) {
            this._notify('validationErrorsValueChanged', [tmp]);
         },
         _selectOnClickHandler: function (event, tmp) {
            this._notify('selectOnClickValueChanged', [tmp]);
         },
         _readOnlyHandler: function (event, tmp) {
            this._notify('readOnlyValueChanged', [tmp]);
         }
      });
      return PropertyGrid;
   }
);