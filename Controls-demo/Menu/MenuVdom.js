define('Controls-demo/Menu/MenuVdom', [
   'Core/Control',
   'wml!Controls-demo/Menu/MenuVdom',
   'Core/core-clone',
   'Types/collection',
   'Controls/history',
   'Controls/Constants',
   'Types/source',
   'Core/Deferred',
   'Types/entity',
   'wml!Controls-demo/Menu/DemoGroupTemplate',
], function(Control, template, cClone, collection, history, ControlsConstants, source, Deferred, entity) {
   'use strict';
   var ModuleClass = Control.extend(
      {
         _template: template,
         _styles: ['Controls-demo/Dropdown/MenuVdom', 'Controls-demo/Menu/MenuVdom'],
         _itemsGroup: null,
         _defaultItems: null,
         _beforeMount: function() {
            this.recordData = {
               pinned: {
                  _type: 'recordset',
                  d: [
                     [
                        '1', null, 'TEST_HISTORY_ID_V1'
                     ],
                     [
                        '2', null, 'TEST_HISTORY_ID_V1'
                     ]
                  ],
                  s: [
                     { n: 'ObjectId', t: 'Строка' },
                     { n: 'ObjectData', t: 'Строка' },
                     { n: 'HistoryId', t: 'Строка' }
                  ]
               },
               frequent: {
                  _type: 'recordset',
                  d: [
                     [
                        '3', null, 'TEST_HISTORY_ID_V1'
                     ],

                     [
                        '4', null, 'TEST_HISTORY_ID_V1'
                     ]
                  ],
                  s: [
                     { n: 'ObjectId', t: 'Строка' },
                     { n: 'ObjectData', t: 'Строка' },
                     { n: 'HistoryId', t: 'Строка' }
                  ]
               },
               recent: {
                  _type: 'recordset',
                  d: [
                     [
                        '5', null, 'TEST_HISTORY_ID_V1'
                     ]
                  ],
                  s: [
                     { n: 'ObjectId', t: 'Строка' },
                     { n: 'ObjectData', t: 'Строка' },
                     { n: 'HistoryId', t: 'Строка' }
                  ]
               }
            };
            this._defaultItems = [
               {
                  id: '1',
                  title: 'Запись 1 с длинным названием'
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
               },
               {
                  id: '9',
                  title: 'Запись 9'
               },
               {
                  id: '10',
                  title: 'Запись 10'
               },
               {
                  id: '11',
                  title: 'Запись 11'
               },
               {
                  id: '12',
                  title: 'Запись 12'
               },
               {
                  id: '13',
                  title: 'Запись 13'
               },
               {
                  id: '14',
                  title: 'Запись 14'
               },
               {
                  id: '15',
                  title: 'Запись 15'
               },
               {
                  id: '16',
                  title: 'Запись 16'
               },
            ];
            this._itemsGroup = {
               method: function(item) {
                  if (item.get('group') === 'hidden' || !item.get('group')) {
                     return ControlsConstants.view.hiddenGroup;
                  }
                  return item.get('group');
               },
               template: '',
            };
         },
         _createMemory: function(items) {
            var srcData = new source.DataSet({
               rawData: {
                  frequent: this._createRecordSet( this.recordData.frequent),
                  pinned: this._createRecordSet( this.recordData.pinned),
                  recent: this._createRecordSet( this.recordData.recent)
               },
               itemsProperty: '',
               keyProperty: 'ObjectId'
            });

            // возвращаем historySource
            var hs = new history.Source({
               originSource: new source.Memory({
                  keyProperty: 'id',
                  data: items
               }),

               // TEST_HISTORY_ID
               // TEST_HISTORY_ID_V1
               historySource: new history.Service({
                  historyId: 'TEST_HISTORY_ID',
                  pinned: true,
               }),
               parentProperty: 'parent',
               nodeProperty: '@parent'
            });
            // Заглушка, чтобы демка не ломилась не сервис истории
            hs.historySource.update = function() {
               return {};
            };
            var query = new source.Query().where({
               $_history: true
            });
            hs.historySource.query = function() {
               var def = new Deferred();
               def.addCallback(function(set) {
                  return set;
               });
               def.callback(srcData);
               return def;
            };
            hs.query(query);
            hs.historySource.query();
            return hs;
         },

         _getHierarchyMenuItems: function() {
            var items = cClone(this._defaultItems);
            var hierConfig = [
               { parent: null, '@parent': false, icon: 'icon-medium icon-Author icon-primary' },
               { parent: null, '@parent': false },
               { parent: null, '@parent': false },
               { parent: null, '@parent': false },
               { parent: null, '@parent': false },
               { group: 'Group 1', '@parent': false },
               { parent: null, '@parent': false },
               { parent: null, '@parent': false },
               { group: 'Group 1', '@parent': true },
               { parent: '9', '@parent': true, icon: 'icon-medium icon-Author icon-primary' },
               { parent: '10', '@parent': false },
               { parent: '10', '@parent': false },
               { group: 'Group 2', parent: null, '@parent': false },
               { group: 'Group 2', parent: null, '@parent': false },
               { group: 'Group 3', parent: null, '@parent': false },
               { group: 'Group 3', parent: null, '@parent': false }
            ];
            for (var i = 0; i < items.length; i++) {
               items[i].parent = hierConfig[i].parent;
               items[i]['@parent'] = hierConfig[i]['@parent'];
               items[i].icon = hierConfig[i].icon;
               items[i].group = hierConfig[i].group || ControlsConstants.view.hiddenGroup;
            }
            return this._createMemory(items);
         },

         _createRecordSet: function(data) {
            return new collection.RecordSet({
               rawData: data,
               keyProperty: 'ObjectId',
               adapter: new entity.adapter.Sbis()
            });
         },
      }
   );
   return ModuleClass;
});
