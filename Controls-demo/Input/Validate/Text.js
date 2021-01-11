define('Controls-demo/Input/Validate/Text', [
   'UI/Base',
   'wml!Controls-demo/Input/Validate/Text',
   'Controls/validate'
], function(Base, template) {
   'use strict';
   var VdomDemoText = Base.Control.extend({
      _template: template,
      _value4: '',
      _placeholder: 'Input text',
   });
   VdomDemoText._styles = ['Controls-demo/Input/resources/VdomInputs'];

   return VdomDemoText;
});
