define('Controls-demo/AsyncTest/DepthAsync/Test5',
   [
      'UI/Base',
      'wml!Controls-demo/AsyncTest/DepthAsync/Test5',
   ], function (Base, template) {
      'use strict';

      var testDepthModule = Base.Control.extend({
         _template: template,
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

      testDepthModule._styles = ['Controls-demo/AsyncTest/AsyncTestDemo', 'Controls-demo/AsyncTest/DepthAsync/Depth'];

      return testDepthModule;
   });
