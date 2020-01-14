define(
   [
      'Controls/_filterPopup/History/List',
      'Core/Serializer',
      'Types/chain',
      'ControlsUnit/Filter/Button/History/testHistorySource',
      'Controls/filter',
      'Types/entity',
      'Controls/history',
      'Types/collection',
      'Env/Env'
   ],
   function(List, Serializer, chain, HistorySourceDemo, filter, entity, history, collection, Env) {
      describe('FilterHistoryList', function() {
         var items2 = [
            {id: 'period', value: [3], resetValue: [1], textValue: 'Past month'},
            {id: 'state', value: [1], resetValue: [1]},
            {id: 'limit', value: [1], resetValue: '', textValue: 'Due date', visibility: false},
            {id: 'sender', value: '', resetValue: '', visibility: false},
            {id: 'author', value: 'Ivanov K.K.', textValue: 'Ivanov K.K.', resetValue: ''},
            {id: 'responsible', value: '', resetValue: '', visibility: false},
            {id: 'tagging', value: '', resetValue: '', textValue: 'Marks', visibility: false},
            {id: 'operation', value: '', resetValue: '', visibility: false},
            {id: 'group', value: [1], resetValue: '', visibility: false},
            {id: 'unread', value: true, resetValue: false, textValue: 'Unread', visibility: false},
            {id: 'loose', value: true, resetValue: '', textValue: 'Loose', visibility: false},
            {id: 'own', value: [2], resetValue: '', textValue: 'On department', visibility: false},
            {id: 'our organisation', value: '', resetValue: '', visibility: false},
            {id: 'document', value: '', resetValue: '', visibility: false},
            {id: 'activity', value: [1], resetValue: '', selectedKeys: [1], visibility: false}
         ];

         var items1 = [
            {id: 'period', value: [3], resetValue: [1], textValue: 'Past month'},
            {id: 'state', value: [1], resetValue: [1]},
            {id: 'limit', value: [1], resetValue: '', textValue: 'Due date', visibility: true},
            {id: 'sender', value: '', resetValue: '', textValue: 'Petrov B.B', visibility: true},
            {id: 'author', value: 'Ivanov K.K.', textValue: 'Ivanov K.K.', resetValue: ''},
            {id: 'responsible', value: '', resetValue: '', visibility: false},
            {id: 'tagging', value: '', resetValue: '', textValue: 'Marks', visibility: false},
            {id: 'operation', value: '', resetValue: '', visibility: false},
            {id: 'group', value: [1], resetValue: '', visibility: false},
            {id: 'unread', value: true, resetValue: false, textValue: 'Unread', visibility: true},
            {id: 'loose', value: true, resetValue: '', textValue: 'Loose', visibility: false},
            {id: 'own', value: [2], resetValue: '', textValue: 'On department', visibility: true},
            {id: 'our organisation', value: '', resetValue: '', visibility: false},
            {id: 'document', value: '', resetValue: '', visibility: false},
            {id: 'activity', value: [1], resetValue: '', selectedKeys: [1], visibility: false}
         ];

         var itemsHistory = [items1, items2];

         var list = new List();

         var config = {
            historyId: 'TEST_HISTORY_ID',
            orientation: 'vertical'
         };

         var items = [
            {id: 'period', value: [2], resetValue: [1], textValue: 'Today'},
            {id: 'sender', value: '', resetValue: '', textValue: ''},
            {id: 'author', value: 'Ivanov K.K.', resetValue: '', textValue: 'Ivanov K.K.', visibility: true},
            {id: 'responsible', value: '', resetValue: '', textValue: 'Petrov T.T.', visibility: false}
         ];

         after(() => {
            list.destroy();
         });

         filter.HistoryUtils.loadHistoryItems({historyId: 'TEST_HISTORY_ID'}).addCallback(function(items) {
            config.items = items;
            config.filterItems = items;
         });

         list.saveOptions(config);

         it('_historyCount', function() {
            list._beforeMount({
               items: new collection.RecordSet(),
               filterItems: []
            });
            assert.equal(list._historyCount, history.Constants.MAX_HISTORY);
         });

         it('get text', function() {
            var textArr = [];
            list._beforeMount(config);
            textArr = list._getText(list._options.items, items, filter.HistoryUtils.getHistorySource({historyId: config.historyId}));
            assert.equal(textArr[0], 'Past month, Due date, Ivanov K.K., Unread, On department');
            assert.equal(textArr[1], 'Past month, Ivanov K.K.');

         });

         it('on resize', function() {
            var updated;
            list._forceUpdate = function() {
               updated = true;
            };
            List._private.onResize(list);
            assert.isTrue(list._isMaxHeight);
            assert.isTrue(updated);

            updated = false;
            List._private.onResize(list);
            assert.isFalse(updated);
         });

         it('click separator', function() {
            list._isMaxHeight = true;
            list._clickSeparatorHandler();
            assert.isFalse(list._isMaxHeight);
         });

         it('_clickHandler', function() {
            var histItems = [];
            list._notify = (e, args) => {
               if (e == 'applyHistoryFilter') {
                  histItems = args[0];
               }
            };
            var savedList = list;
            chain.factory(list._options.items).each(function(item, index) {
               if (item) {
                  savedList._clickHandler('click', item);
                  assert.deepEqual(histItems, itemsHistory[index]);
               }
            });
         });

         it('pin click', function() {
            // ! unit-тест без assert
            if (Env.constants.isServerSide) { return; }
            var savedList = list;
            chain.factory(list._options.items).each(function(item) {
               if (item) {
                  savedList._onPinClick('click', item);
               }
            });
         });

         it('_onFavoriteClick', () => {
            const event = {
               target: 'testTarget'
            };
            const favoriteItem = new entity.Model({
               rawData: {
                  ObjectId: 'testId',
                  ObjectData: JSON.stringify({
                     linkText: 'testLinkText',
                     items: items1,
                     globalParams: 0
                  })
               }
            });
            const text = 'savedText';

            let openConfig;

            list._children = {
               stickyOpener: {
                  open: (cfg) => {
                     openConfig = cfg;
                  }
               }
            };
            list._onFavoriteClick(event, favoriteItem, text);
            assert.equal(openConfig.target, 'testTarget');
            assert.deepEqual(openConfig.targetPoint, {
               vertical: 'bottom',
               horizontal: 'left'
            });
            assert.deepEqual(openConfig.direction, {
               horizontal: 'left'
            });
         });

         it('_private::deleteFavorite', () => {
            let closed = false;
            const sandBox = sinon.createSandbox();
            const self = {
               _editItem: {get: () => {}},
               _options: { historyId: '1231123' },
               _children: {
                  stickyOpener: {
                     close: () => closed = true
                  }
               },
               _notify: () => {}
            };

            sandBox.stub(List._private, 'removeRecordFromOldFavorite');
            sandBox.stub(List._private, 'updateOldFavoriteList');
            sandBox.replace(List._private, 'getSource',() => {
               return {
                  remove: () => {},
                  getDataObject: () => {}
               };
            });

            List._private.deleteFavorite(self, {});
            assert.isTrue(closed);
            sinon.assert.calledOnce(List._private.removeRecordFromOldFavorite);
            sinon.assert.calledOnce(List._private.updateOldFavoriteList);
            sandBox.restore();
         });

         describe('_private::mapByField', function() {

            it('map by resetValues', function() {
               var filterItems = [
                  {id: 'period', value: [2], resetValue: [1], textValue: 'Today'},
                  {id: 'sender', value: '', resetValue: 'test_sender', textValue: ''},
                  {id: 'author', value: 'Ivanov K.K.', resetValue: true, textValue: 'Ivanov K.K.', visibility: true},
                  {id: 'responsible', value: '', resetValue: '', textValue: 'Petrov T.T.', visibility: false}
               ];
               var resetValues = List._private.mapByField(filterItems, 'resetValue');
               assert.deepEqual(resetValues, {
                  'period': [1],
                  'sender': 'test_sender',
                  'author': true,
                  'responsible': ''
               });
            });

            it('map by value', function() {
               var byValue = List._private.mapByField(items1, 'value');
               var result = {
                  period: [3],
                  state: [1],
                  limit: [1],
                  sender: '',
                  author: 'Ivanov K.K.',
                  responsible: '',
                  tagging: '',
                  operation: '',
                  group: [1],
                  unread: true,
                  loose: true,
                  own: [2],
                  'our organisation': '',
                  document: '',
                  activity: [1]
               };

               assert.deepEqual(byValue, result);
            });

         });


         it('_private::getStringHistoryFromItems', function() {
            let resetValues = {
               'period': [1],
               'sender': 'test_sender',
               'author': '',
               'responsible': ''
            };
            let historyItems = [
               {name: 'period', value: [2], textValue: 'Today'},
               {name: 'sender', value: '', textValue: ''},
               {name: 'author', value: 'Ivanov K.K.', textValue: 'Ivanov K.K.', visibility: true},
               {name: 'responsible', value: '', textValue: 'Petrov T.T.', visibility: false}
            ];
            let historyString = List._private.getStringHistoryFromItems(historyItems, resetValues);
            assert.strictEqual(historyString, 'Today, Ivanov K.K.');
         });

         it('_private::getEditDialogOptions', function() {
            var favoriteItem = new entity.Model({
               rawData: {
                  ObjectId: 'testId',
                  ObjectData: JSON.stringify({
                     linkText: 'testLinkText',
                     items: items1,
                     globalParams: 0
                  })
               }
            });
            var self = {
               _options: {
                  filterItems: items1
               }
            };
            var editableOptions = List._private.getEditDialogOptions(self, favoriteItem, null, 'savedText');
            assert.equal(editableOptions.editedTextValue, 'savedText');
         });
      });
   });
