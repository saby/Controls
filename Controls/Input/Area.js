define('js!Controls/Input/Area', [
   'js!Controls/Input/Text',
   'Core/constants',
   'WS.Data/Type/descriptor',
   'Core/detection',
   'tmpl!Controls/Input/Area/Area',
   'css!Controls/Input/Area/Area'
], function(Text,
            constants,
            types,
            detection,
            template) {

   'use strict';

   /**
    *
    * Многострочное поле ввода - это текстовое поле с автовысотой.
    * Данное поле может автоматически менять высоту в зависимости от количества введённой информации.
    * @class Controls/Input/Area
    * @extends Controls/Input/Text
    * @control
    * @public
    * @category Input
    * @author Степин Павел Владимирович
    */

   /**
    * @name Controls/Input/Area#minLines
    * @cfg {Number} Минимальное количество строк
    */

   /**
    * @name Controls/Input/Area#maxLines
    * @cfg {Number} Максимальное количество строк
    */

   /**
    * @name Controls/Input/Area#newLineKey
    * @cfg {String} Сочетание клавиш, для перехода на новую строку
    * @variant enter По нажатию Enter
    * @variant ctrlEnter По нажатию Ctrl + Enter
    * @variant shiftEnter По нажатию Shift + Enter.
    */

   var _private = {

      setFakeAreaValue: function(value){
         this._children.fakeAreaValue.innerHTML = value;
      },

      /*
      * Обновляет наличие скролла, в зависимости от того, есть ли скролл на фейковой текст арии
      */
      updateScroll: function(){
         var fakeArea = this._children.fakeArea;
         var needScroll = fakeArea.scrollHeight - fakeArea.clientHeight > 1;

         //Для IE, текст мы показываем из fakeArea, поэтому сдвинем скролл.
         if(needScroll && detection.isIE){
            fakeArea.scrollTop = this._children.realArea.scrollTop;
         }

         if(needScroll !== this._hasScroll){
            this._hasScroll = needScroll;
            this._forceUpdate();
         }
      }
   };

   var Area = Text.extend({

      _controlName: 'Controls/Input/Area',
      _template: template,

      _hasScroll: false,

      _afterMount: function() {
         Area.superclass._afterMount.apply(this, arguments);
         _private.updateScroll.call(this);
      },

      _beforeUpdate: function(newOptions) {
         Area.superclass._beforeUpdate.apply(this, arguments);
         _private.setFakeAreaValue.call(this, newOptions.value);
         _private.updateScroll.call(this);
      },

      _changeValueHandler: function(e, value){
         Area.superclass._changeValueHandler.apply(this, arguments);
         _private.setFakeAreaValue.call(this, value);
         _private.updateScroll.call(this);
      },

      _setValue: function(value){
         Area.superclass._setValue.apply(this, arguments);
         _private.setFakeAreaValue.call(this, value);
         _private.updateScroll.call(this);
      },

      _keyDownHandler: function(e){

         //В режиме newLineKey === 'ctrlEnter' будем эмулировать переход на новую строку в ручную
         if(e.nativeEvent.keyCode === constants.key.enter && this._options.newLineKey === 'ctrlEnter'){

            //Обычный enter прерываем
            if(!e.nativeEvent.shiftKey && !e.nativeEvent.ctrlKey){
               e.preventDefault();
            }

            //Вроде не очень хорошо. Но если хотим перенести на новую строку сами, придется вмешиваться.
            if(e.nativeEvent.ctrlKey){
               e.target.value += '\n';
               this._children.inputRender._inputHandler(e);
            }
         }

      }

   });

   Area.getDefaultOptions = function() {
      return {
         newLineKey: 'enter'
      };
   };

   //TODO раскомментировать когда полечат https://online.sbis.ru/opendoc.html?guid=e53e46a0-9478-4026-b7d1-75cc5ac0398b
   /*Area.getOptionTypes = function() {
      return {
         minLines: types(Number),
         maxLines: types(Number),
         newLineKey: types(String).oneOf([
          'enter',
          'ctrlEnter'
         ])
      };
   };*/

   return Area;

});