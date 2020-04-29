define('Controls-demo/Slider/Base/SliderBaseDemo',
   [
      'Core/Control',
      'Types/source',
      'wml!Controls-demo/Slider/Base/SliderBaseDemo',
      'Controls/slider'
   ],
   function(Control, source, template) {
      'use strict';
      var SliderBaseDemo = Control.extend({
         _template: template,
         _minValue: undefined,
         _maxValue: undefined,
         _scaleStep: undefined,
         _sizeSource: null,
         _size: '',
         _precision: undefined,
         _borderVisible: false,
         _readOnly: false,
         _event: 'none',
         _value: undefined,
         _beforeMount: function(opts){
            this._minValue = 0;
            this._maxValue = 100;
            this._scaleStep = 20;
            this._precision = 0;
            this._value = 80;
            this._size = 'm';
            this._sizeSource = new source.Memory({
               keyProperty: 'title',
               data: [
                  {
                     title: 's'
                  },
                  {
                     title: 'm'
                  }
               ]
            });
         },
         reset: function() {
            this._event = 'none';
         },
         changeMinValue: function(e, val) {
            if (val < this._maxValue){
               this._minValue = val;
            }
         },
         changeMaxValue: function(e, val) {
            if (val > this._minValue){
               this._maxValue = val;
            }
         },
         changeValue: function(e, val) {
            this._value = val;
            this._event = 'valueChanged';
         },
         changePrecision: function(e, val) {
            this._precision = val;
         },
         changeScaleStep: function(e, val) {
            this._scaleStep = val;
         },
         changeSize: function(e, val) {
            this._size = val;
         },
         changeBorderVisible: function(e, val) {
            this._borderVisible = val;
         },
         changeReadOnly: function(e, val) {
            this._readOnly = val;
         },

      });

      SliderBaseDemo._styles = ['Controls-demo/Slider/Base/SliderBaseDemo'];

      return SliderBaseDemo;
   }
);
