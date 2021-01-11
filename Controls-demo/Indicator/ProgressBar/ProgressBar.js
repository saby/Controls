define('Controls-demo/Indicator/ProgressBar/ProgressBar',
   [
      'UI/Base',
      'wml!Controls-demo/Indicator/ProgressBar/ProgressBar',
      'json!Controls-demo/PropertyGrid/pgtext',

   ],

   function(Base, template, config) {
      'use strict';
      var ModuleClass = Base.Control.extend({
         _template: template,
         _metaData: null,
         _content: 'Controls/progress:Bar',
         _dataObject: null,
         _componentOptions: null,
         _beforeMount: function() {
            this._dataObject = {
               value: {
                  precision: 0
               },
               name: {
                  readOnly: true
               }
            };
            this._componentOptions = {
               value: 30,
               name: 'ProgressBar'
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
   
      ModuleClass._styles = ['Controls-demo/Wrapper/Wrapper', 'Controls-demo/Indicator/ProgressBar/ProgressBar'];

      return ModuleClass;
});
