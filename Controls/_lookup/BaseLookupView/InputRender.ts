import input = require('Controls/input');
import template = require('wml!Controls/_lookup/BaseLookupView/InputRender/InputRender');
import * as ActualAPI from "../../_input/ActualAPI";


   var InputRenderLookup = input.Text.extend({
      _template: template,
      _defaultInput: null,

      _beforeMount: function(options) {
         InputRenderLookup.superclass._beforeMount.apply(this, arguments);
         this._inlineHeight = input.ActualAPI.inlineHeight(options.size, options.inlineHeight);
      },

      _beforeUpdate: function(options) {
         InputRenderLookup.superclass._beforeUpdate.apply(this, arguments);
         this._inlineHeight = input.ActualAPI.inlineHeight(options.size, options.inlineHeight);
      },

      _beforeUnmount: function() {
         this._defaultInput = null;
      },

      _getField: function() {
         if (this._options.isInputVisible) {
            return InputRenderLookup.superclass._getField.call(this);
         } else {
            // В поле связи с единичным выбором после выбора записи
            // скрывается инпут (технически он в шаблоне создаётся под if'ом),
            // но базовый input:Text ожидает, что input в вёрстке есть всегда.
            // Для корректной работы создаём виртуальный input.
            // Если его скрывать через display: none, то начинаются проблемы с фокусом,
            // поэтому данный способ нам не подходит.
            return this._getDefaultInput();
         }
      },

      _getReadOnlyField(): HTMLElement {
         // В поле связи с единичным выбором не строится input
         // Подробнее в комментарии в методе _getField
         if (this._options.isInputVisible) {
            return InputRenderLookup.superclass._getReadOnlyField.call(this);
         } else {
            return this._getDefaultInput();
         }
      },

      _getDefaultInput: function() {
         if (!this._defaultInput) {
            this._defaultInput = document.createElement('input');
         }

         return this._defaultInput;
      },

      _keyDownInput: function(event) {
         this._notify('keyDownInput', [event]);
      }
   });

   InputRenderLookup._theme = ['Controls/lookup'];

   export = InputRenderLookup;

