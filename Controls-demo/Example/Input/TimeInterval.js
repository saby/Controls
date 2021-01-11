define('Controls-demo/Example/Input/TimeInterval',
   [
      'UI/Base',
      'Types/entity',
      'Controls-demo/Example/Input/SetValueMixin',
      'wml!Controls-demo/Example/Input/TimeInterval/TimeInterval',

      'Controls/input',
      'Controls-demo/Example/resource/BaseDemoInput'
   ],
   function(Base, entity, SetValueMixin, template) {
      'use strict';

      var TimeInterval = Base.Control.extend([SetValueMixin], {
         _template: template,

         constructor: function() {
            TimeInterval.superclass.constructor.apply(this, arguments);

            var fTimeInterval = entity.TimeInterval;

            this._default1Value = new fTimeInterval('P0DT12H30M00S');
            this._default2Value = new fTimeInterval('P0DT12H30M00S');
            this._default3Value = new fTimeInterval('P0DT120H00M00S');
            this._default4Value = new fTimeInterval('P0DT9H35M27S');
         }
      });

      return TimeInterval;
   });
