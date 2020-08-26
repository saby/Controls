define('Controls/Application/TouchDetector', [
   'Core/Control',
   'wml!Controls/Application/TouchDetector/TouchDetector',
   'Env/Env',
   'Controls/context'
], function(
   Control,
   template,
   Env,
   context
) {
   return Control.extend({
      moveInRow: 1,

      // При инициализации необходимо проставить значение, далее значение определяется в зависимости от событий
      state: Env.compatibility.touch,
      lastState: Env.compatibility.touch,
      _template: template,

      _updateTouchObject: function() {
         if (this.state !== this.lastState) {
            this._touchObjectContext.setIsTouch(this.state);
            this.lastState = this.state;
            this._forceUpdate();
            this._notify('changeTouchState', [this.lastState]);
         }
      },

      _beforeMount: function() {
         this._createContext();
      },

      _createContext: function() {
         this._touchObjectContext = new context.TouchContextField(this.state);
      },

      touchHandler: function() {
         this.state = true;
         this._updateTouchObject();
         this.moveInRow = 0;
      },

      moveHandler: function() {
         if (this.moveInRow > 0) {
            this.state = false;
            this._updateTouchObject();
         }
         this.moveInRow++;
      },

      isTouch: function() {
         return !!this.state;
      },

      getClass: function() {
         return this.state ? 'ws-is-touch' : 'ws-is-no-touch';
      },

      // Объявляем функцию, которая возвращает поля Контекста и их значения.
      // Имя функции фиксировано.
      _getChildContext: function() {
         // Возвращает объект.
         return {
            isTouch: this._touchObjectContext
         };
      }
   });
});
