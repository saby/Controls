define('ControlsUnit/Input/Base/InputUtility',
   [
      'UICommon/Events'
   ],
   function(Events) {
      'use strict';

      var SyntheticEvent = Events.SyntheticEvent;

      var _private = {
         setSelectionRange: function(input, start, end) {
            input.selectionStart = start;

            if (end === undefined) {
               input.selectionEnd = start;
               return;
            }

            input.selectionEnd = end;
         },
         insert: function(input, text) {
            var field = input._getField();
            var currentValue = field.value;

            field.value = currentValue.substring(0, field.selectionStart) + text + currentValue.substring(field.selectionEnd);
            _private.setSelectionRange(input, field.selectionStart + text.length);
         },
         remove: function(input) {
            _private.insert(input, '');
         },
         cleaningKeys: function(input, key) {
            if (input.selectionStart === input.selectionEnd) {
               switch (key) {
                  case 'backspace':
                     input.selectionStart--;
                     break;
                  case 'delete':
                     input.selectionEnd++;
                     break;
                  default:
                     break;
               }
            }

            _private.remove(input);
         }
      };

      return {

         /**
          * @param {Controls/input:Base} input
          * @param [value]
          * @param {Number} [start]
          * @param {Number} [end]
          */
         init: function(input, value, start, end) {
            if (input._viewModel === null) {
               input._beforeMount({
                  value: null
               });
            }

            if (value) {
               _private.setSelectionRange(input, start, end);
               input._selectHandler();
               input._beforeUpdate({
                  value: value
               });
               input._template(input);
            }
         },

         /**
          * @param {Controls/input:Base} input
          * @param {Number} start
          * @param {Number} end
          */
         setSelectionRange: function(input, start, end) {
            _private.setSelectionRange(input, start, end);
         },

         /**
          * @param {Controls/input:Base} input
          * @param {String} text
          */
         insert: function(input, text) {
            _private.insert(input, text);
         },

         /**
          * @param {Controls/input:Base} input
          */
         backspace: function(input) {
            _private.cleaningKeys(input, 'backspace');
         },

         /**
          * @param {Controls/input:Base} input
          */
         delete: function(input) {
            _private.cleaningKeys(input, 'delete');
         },

         triggerInput: function(input) {
            input._inputHandler(new SyntheticEvent({}));
         }
      };
   });
