define(['Controls/lookup', 'Types/entity', 'Types/collection'], function(lookup, entity, collection) {
   describe('"Controls/_lookup/SelectedCollection', function() {
      function getItems(countItems) {
         for (var items = []; countItems; countItems--) {
            items.push(new entity.Model({
               rawData: {id: countItems},
               keyProperty: 'id'
            }));
         }

         return new collection.List({
            items: items
         });
      }

      if (typeof window === 'undefined') {
         // Кастыль, дабы избежать работы с версткой
         lookup.Collection.prototype.getCounterWidth = function(itemsCount, readOnly, itemsLayout) {
            // in mode read only and single line, counter does not affect the collection
            if (readOnly && itemsLayout === 'oneRow') {
               return 0;
            }

            return itemsCount * 10;
         }
      }

      it('_beforeUpdate', function() {
         let collection = new lookup.Collection();
         let isOpenedInfoBox = false;
         let isNotifyCloseInfoBox = false;

         collection._getCounterWidth = () => 0;
         collection._children = {
            infoBox: {
               isOpened: () => isOpenedInfoBox
            }
         };
         collection._notify = (eventName) => {
            if (eventName === 'closeInfoBox') {
               isNotifyCloseInfoBox = true;
            }
         };

         collection._beforeUpdate({
            items: getItems(1),
            maxVisibleItems: 1
         });
         assert.isFalse(isNotifyCloseInfoBox);

         collection._beforeUpdate({
            items: getItems(2),
            maxVisibleItems: 1
         });
         assert.isFalse(isNotifyCloseInfoBox);

         isOpenedInfoBox = true;
         collection._beforeUpdate({
            items: getItems(2),
            maxVisibleItems: 1
         });
         assert.isFalse(isNotifyCloseInfoBox);

         collection._beforeUpdate({
            items: getItems(1),
            maxVisibleItems: 1
         });
         assert.isTrue(isNotifyCloseInfoBox);
      });

      it('_openInfoBox', function() {
         var
            items = [1, 2, 3, 4],
            collection = new lookup.Collection(),
            templateOptions;

         items.clone = () => items.slice();
         collection._options.items = items;
         collection._container = {};
         collection._children = {
            infoBox: {
               open: (config) => {
                  templateOptions = config.templateOptions;
               }
            }
         };

         collection._openInfoBox();
         assert.deepEqual(templateOptions.items, items);

         // Проверка на то что список элементов не будет меняться по ссылке
         templateOptions.items.push(10);
         assert.notDeepEqual(templateOptions.items, items);
      });

      it('_isShowCounter', function() {
         let collection = new lookup.Collection();

         assert.isFalse(collection._isShowCounter(1, 2));
         assert.isFalse(collection._isShowCounter(2, 2));
         assert.isTrue(collection._isShowCounter(3, 2));
      });

      it('_afterMount', function() {
         var
            isUpdate = false,
            selectedCollection = new lookup.Collection();

         selectedCollection._counterWidth = 0;
         selectedCollection._options.items = getItems(3);
         selectedCollection._options.maxVisibleItems = 5;
         selectedCollection._forceUpdate = function() {
            isUpdate = true;
         };

         selectedCollection._afterMount();
         assert.equal(selectedCollection._counterWidth, 0);
         assert.isFalse(isUpdate);

         selectedCollection._options.maxVisibleItems = 2;
        /* selectedCollection._afterMount();
         assert.notEqual(selectedCollection._counterWidth, 0);
         assert.isTrue(isUpdate);*/
      });

      it('_itemClick', function() {
         var sandbox = sinon.createSandbox();
         var propagationStopped = false;
         var selectedCollection = new lookup.Collection();
         var model = new entity.Model({
            rawData: {
               id: 'test',
            },
            keyProperty: 'id'
         });
         var currentSelector;
         var event = {
            target: {
               closest: function(cssSelector) {
                  return cssSelector === currentSelector;
               }
            },
            stopPropagation: function() {
               propagationStopped = true;
            }
         };

         sandbox.stub(selectedCollection, '_notify');

         currentSelector = '.js-controls-SelectedCollection__item__caption';
         selectedCollection._itemClick(event, model);
         sinon.assert.calledWith(selectedCollection._notify, 'itemClick', [model]);
         assert.isTrue(propagationStopped);

         currentSelector = '.js-controls-SelectedCollection__item__cross';
         selectedCollection._itemClick(event, model);
         sinon.assert.calledWith(selectedCollection._notify, 'crossClick', [model]);
         assert.isTrue(propagationStopped);

         sandbox.restore();
      });
   });
});
