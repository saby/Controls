define('Controls-demo/Slider/Base/StandartSliderBaseDemo',
   [
      'UI/Base',
      'wml!Controls-demo/Slider/Base/StandartSliderBaseDemo',
      'Controls/slider'
   ],
   function(BaseMod, template) {
      'use strict';
      var StandartSliderBaseDemo = BaseMod.Control.extend({
         _template: template,
         _inputValue: null,
         _minValueI: undefined,
         _maxValueI: undefined,
         _valueI: undefined,
         _beforeMount: function() {
            this._inputValue = 100;
            this._minValueI = 0;
            this._maxValueI = 100;
         },
         _inputCompleted: function(e, val) {
            this._inputValue = this._valueI = Math.min(this._maxValueI, Math.max(val, this._minValueI));
         }
      });

      StandartSliderBaseDemo._styles = ['Controls-demo/Slider/Base/StandartSliderBaseDemo'];

      return StandartSliderBaseDemo;
   }
);
