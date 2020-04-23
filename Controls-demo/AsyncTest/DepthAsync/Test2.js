define('Controls-demo/AsyncTest/DepthAsync/Test2',
   [
      'Core/Control',
      'wml!Controls-demo/AsyncTest/DepthAsync/Test2',
   ], function (Control, template) {
      'use strict';

      var testDepthModule = Control.extend({
         _template: template,
         _styles: ['Controls-demo/AsyncTest/AsyncTestDemo', 'Controls-demo/AsyncTest/DepthAsync/Depth'],
         _isGrid: true,
         _readOnly: false,

         _setGridState: function() {
            this._isGrid = !this._isGrid;
            this._forceUpdate();
         },
         _setReadState: function() {
            this._readOnly = !this._readOnly;
            this._forceUpdate();
         },
      });

      return testDepthModule;
   });
