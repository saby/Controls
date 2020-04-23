define('Controls-demo/Input/Validate/Text', [
   'Core/Control',
   'wml!Controls-demo/Input/Validate/Text',
   'Controls/validate'
], function(Control, template) {
   'use strict';
   var VdomDemoText = Control.extend({
      _template: template,
      _styles: ['Controls-demo/Input/resources/VdomInputs'],
      _value4: '',
      _placeholder: 'Input text',
   });
   return VdomDemoText;
});
