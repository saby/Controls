define('Controls-demo/Selector/Suggest/Suggest',
   [
      'Core/Control',
      'wml!Controls-demo/Selector/Suggest/Suggest',
      'Types/source',
      'Controls-demo/Utils/MemorySourceFilter',
   ],
   function(Control, template, source, memorySourceFilter) {

      'use strict';


      var ComboBox = Control.extend({
         _template: template,
         _source: null,
         _value: '',
         _selectedKey: '1',
         _selectedKeyAutoDropDown: '1',

         _beforeMount: function() {
            this._source = new source.Memory({
               keyProperty: 'id',
               searchParam: 'title',
               filter: memorySourceFilter(),
               data: [
                  {
                     id: '1',
                     title: 'Yaroslavl'
                  },
                  {
                     id: '2',
                     title: 'Moscow'
                  },
                  {
                     id: '3',
                     title: 'St-Petersburg'
                  },
                  {
                     id: '4',
                     title: 'Novosibirsk'
                  },
                  {
                     id: '5',
                     title: 'Rybinsk'
                  },
                  {
                     id: '6',
                     title: 'Kostroma'
                  }
               ]
            });
            this._sourceAutoDropDown = new source.Memory({
               keyProperty: 'id',
               searchParam: 'title',
               filter: memorySourceFilter(),
               data: [
                  {
                     id: '1',
                     title: 'Yaroslavl'
                  },
                  {
                     id: '2',
                     title: 'Moscow'
                  },
                  {
                     id: '3',
                     title: 'St-Petersburg'
                  },
                  {
                     id: '4',
                     title: 'Novosibirsk'
                  },
                  {
                     id: '5',
                     title: 'Rybinsk'
                  },
                  {
                     id: '6',
                     title: 'Kostroma'
                  }
               ]
            });
         }
      });

      ComboBox._styles = ['Controls-demo/Selector/Suggest/Suggest'];

      return ComboBox;
   }
);
