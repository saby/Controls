define('Controls-demo/Slider/Range/StandartSliderRangeDemo',
   [
      'Core/Control',
      'Env/Env',
      'wml!Controls-demo/Slider/Range/StandartSliderRangeDemo',
      'Controls/slider'
   ],
   function(Control, Env, template) {
      'use strict';
      var StandartSliderRangeDemo = Control.extend({
         _template: template,


         _inputStartValue: null,
         _inputEndValue: null,
         _startValueI: undefined,
         _endValueI: undefined,
         _minValueI: undefined,
         _maxValueI: undefined,

         _beforeMount: function() {
            this._inputStartValue = 0;
            this._inputEndValue = 100;
            this._minValueI = 0;
            this._maxValueI = 100;
         },

         _startInputCompleted: function(e, val) {
            this._inputStartValue = this._startValueI = Math.min(this._maxValueI, Math.max(val, this._minValueI));
            if (this._endValueI < this._startValueI) {
               this._inputEndValue = this._endValueI = this._startValueI;
            }
         },

         _endInputCompleted: function(e, val) {
            this._inputEndValue = this._endValueI = Math.max(this._minValueI, Math.min(val, this._maxValueI));
            if (this._endValueI < this._startValueI) {
               this._inputStartValue = this._startValueI = this._endValueI;
            }
         },
         _inputKeyDown: function(e) {
            var key = e.nativeEvent.keyCode;

            //по нажатию на enter в первом поле ввода, нужно перенести фокус на второе
            if (key === Env.constants.key.enter) {
               this._children.inputEndValue.activate();
            }
         }

      });

      StandartSliderRangeDemo._styles = ['Controls-demo/Slider/Range/StandartSliderRangeDemo'];

      return StandartSliderRangeDemo;
   }
);
