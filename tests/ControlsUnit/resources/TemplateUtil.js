define('ControlsUnit/resources/TemplateUtil',
   [
      'Core/helpers/String/unEscapeASCII',
      'wml!ControlsUnit/resources/SimpleContent',
      'UI/Base'
   ],
   function(unEscapeASCII, SimpleContent, UIBase) {
      'use strict';

      var _private = {
         ignoreSpaces: [unEscapeASCII('&#65279;')],

         regExpSpacesString: /\s+/g,

         regExpAdditionalAttributes: / ?(data-component|ws-delegates-tabfocus|ws-creates-context|__config|tabindex|name|config|hasMarkup)=".+?"/g,

         regScripts: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
      };

      return {
         content: SimpleContent,

         clearTemplate: function(template) {
            const self = this;
            return function(inst, callback) {
               let result;
               if (inst instanceof UIBase.Control) {
                  result = template.apply(inst, [inst]);
               } else {
                  result = template(inst);
               }
               if (!callback) {
                  return self.clearMarkup(result);
               }
               if (result.then !== undefined) {
                  return result
                     .then(function(markup) {
                        return callback(self.clearMarkup(markup));
                     })
                     .catch(function() {
                        return Promise.resolve('');
                     });
               }
               return callback(self.clearMarkup(result));
            };
         },

         clearMarkup: function(_markup) {
            let markup = _markup.replace(_private.regExpSpacesString, function(substr) {
               if (_private.ignoreSpaces.includes(substr)) {
                  return '';
               }

               return ' ';
            });
            markup = markup.replace(_private.regExpAdditionalAttributes, '');

            return this.clearScripts(markup);
         },

         clearScripts: function(markup) {
            var innerMarkup = markup;
            while (_private.regScripts.test(innerMarkup)) {
               innerMarkup = markup.replace(_private.regScripts, '');
            }
            return innerMarkup;
         }
      };
   });
