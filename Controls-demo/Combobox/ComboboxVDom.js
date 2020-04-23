define('Controls-demo/Combobox/ComboboxVDom',
   [
      'Core/Control',
      'wml!Controls-demo/Combobox/ComboboxVDom',
      'Types/source',
      'Controls-demo/Combobox/historySourceCombobox',
      'Controls/dropdown',
      'wml!Controls-demo/Combobox/itemTemplateCombobox',
      'wml!Controls-demo/Combobox/itemTemplateMultiline',
   ],
   function(Control, template, source, historySourceCombobox) {

      'use strict';


      var ComboBox = Control.extend({
         _template: template,
         _styles: ['Controls-demo/Combobox/ComboboxVDom', 'Controls-demo/Controls-demo'],
         _itemsRegions: null,
         _itemsCode: null,
         _itemsWorkers: null,
         _defaultItems: null,
         _cities: null,
         _selectedKey7: 'Branch, representative of a foreign legal entity accredited in accordance with ' +
         'the established procedure in the ',
         _selectedKeyReadOnly: '1',
         _selectedKeyHistory: null,
         _historySource: null,

         _beforeMount: function() {
            this._itemsRegions = [
               {
                  id: '1',
                  title: 'Yaroslavl'
               },
               {
                  id: '2',
                  title: 'Moscow'
               }
            ];
            this._itemsCode = [
               {id: 1, text: '01-disease', comment: 'The first 3 days are paid by the employer, the remaining days are paid for by the FSS'},
               {id: 2, text: '02-injury', comment: 'The first 3 days are paid by the employer, the remaining days are paid for by the FSS'},
               {id: 3, text: '03-quarantine', comment: 'Fully paid by the FSS'}
            ];
            this._itemsWorkers = [
               {id: 1, title: 'Russian commercial organization'},
               {id: 2, title: 'Russian scientific organization'},
               {id: 3, title: 'Branch, representative of a foreign legal entity accredited in accordance with ' +
               'the established procedure in the territory of the Russian Federation'}
            ];
            this._defaultItems = [
               {
                  id: '1',
                  title: 'Запись 1'
               },
               {
                  id: '2',
                  title: 'Запись 2'
               },
               {
                  id: '3',
                  title: 'Запись 3'
               },
               {
                  id: '4',
                  title: 'Запись 4'
               },
               {
                  id: '5',
                  title: 'Запись 5'
               },
               {
                  id: '6',
                  title: 'Запись 6'
               },
               {
                  id: '7',
                  title: 'Запись 7'
               },
               {
                  id: '8',
                  title: 'Запись 8'
               }
            ];
            this._cities = ['Yaroslavl', 'Moscow', 'St-Petersburg', 'Astrahan', 'Arhangelsk', 'Abakan', 'Barnaul', 'Belgorod',
               'Voronezh', 'Vladimir', 'Bryansk', 'Ekaterinburg', 'Kostroma', 'Vologda', 'Pskov', 'Kirov'];
            this._historySource = historySourceCombobox.createMemory();
         },

         _createMemory: function(items) {
            return new source.Memory({
               keyProperty: 'id',
               data: items
            });
         },

         _getMultiData: function() {
            var items = [];
            for (var i = 0; i < 16; i++) {
               items.push({
                  id: '' + i + 1,
                  title: this._cities[i]
               });
            }
            return this._createMemory(items);
         }
      });

      return ComboBox;
   }
);
