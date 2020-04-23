define('Controls-demo/Switch/DoubleSwitchDemo', [
   'Core/Control',
   'Types/source',
   'wml!Controls-demo/Switch/DoubleSwitchDemo',
], function(Control, source, template) {
   'use strict';
   var ModuleClass = Control.extend(
      {
         _template: template,
         _styles: ['Controls-demo/Headers/resetButton', 'Controls-demo/Switch/UnionSwitchDemo', 'Controls-demo/Switch/DoubleSwitchDemo'],
         _orientationSource: null,
         _selectedOrientation: 'horizontal',
         _caption1: 'on',
         _caption2: 'off',
         _tooltip: '',
         _eventName: 'no event',
         _beforeMount: function() {
            this._orientationSource = new source.Memory({
               keyProperty: 'title',
               data: [
                  {
                     title: 'horizontal'
                  },
                  {
                     title: 'vertical'
                  }
               ]
            });
         },

         changeOrientation: function(e, key) {
            this._selectedOrientation = key;
         },

         changeValue: function(e, value) {
            this._value = value;
            this._eventName = 'valueChanged';
         },
         reset: function() {
            this._eventName = 'no event';
         }
      });
   return ModuleClass;
});
