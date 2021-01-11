define('Controls-demo/CustomAttributeValue/CustomAttributeDemo',
   [
      'UI/Base',
      'wml!Controls-demo/CustomAttributeValue/CustomAttributeDemo',
   ],
   function(Base, template) {
      'use strict';

      var customAttributeDemo = Base.Control.extend({
         _template: template,
         _standardCount: 0,
         _customCount: 0,
         _inputControlCount: 0,
         _inputCount: 0,

         _addStandard: function() {
            this._standardCount += 1;
            this._forceUpdate();
         },
         _addCustom: function() {
            this._customCount += 1;
            this._forceUpdate();
         },
         _addControlInput: function() {
            this._inputControlCount += 1;
            this._forceUpdate();
         },
         _addInput: function() {
            this._inputCount += 1;
            this._forceUpdate();
         },
      });
      customAttributeDemo._styles = ['Controls-demo/CustomAttributeValue/CustomAttributeDemo'];

      return customAttributeDemo;
   }
);
