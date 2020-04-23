define('Controls-demo/PropertyGrid/SuggestTemplate/SuggestTemplate',
   [
      'Core/Control',
      'wml!Controls-demo/PropertyGrid/SuggestTemplate/SuggestTemplate',
      'Types/source',
      'Types/collection',
      'wml!Controls-demo/Input/Suggest/resources/SuggestTemplate',
   ],
   function(Control, template, source, collection) {
      'use strict';

      var sugTmpl = Control.extend({
         _template: template,
         _styles: ['Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Input/Suggest/Suggest'],
         _viewValue: '',
         _source: null,

         _beforeMount: function(options) {
            this._source = new source.Memory({
               keyProperty: 'title',
               data: options.items
            });
            this.rs = new collection.RecordSet({
               keyProperty: 'title',
               rawData: options.items
            });

            this.selectedKey = options.value;
         },
         selectedKeyChanged: function(event, key) {
            this._notify('choose', [this.rs.getRecordById(key)]);
         }
      });

      return sugTmpl;
   });
