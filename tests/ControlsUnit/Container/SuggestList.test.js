define(
   ['Controls/suggestPopup', 'Controls/_suggestPopup/List', 'Env/Env', 'Types/entity', 'Types/collection', 'Controls/dataSource', 'Types/source', 'sinon'],
   function(suggestPopup, SuggestPopupListContainer, Env, entity, collection, dataSource, sourceLib, sinon) {

      'use strict';

      function getSuggestItems() {
         return new collection.RecordSet({
            data: [
               {
                  id: 0,
                  title: 'Sasha'
               },
               {
                  id: 1,
                  title: 'Aleksey'
               },
               {
                  id: 2,
                  title: 'Dmitry'
               }
            ]
         });
      }

      describe('Controls.Container.Suggest.List', function() {
         describe('_beforeUpdate', function() {
            var suggestList = new SuggestPopupListContainer();
            var optionsObject = {
               _suggestListOptions: {
                  tabsSelectedKey: null
               }
            };
            var optionsObjectWithNewKey = {
               _suggestListOptions: {
                  tabsSelectedKey: 'test'
               }
            };

            var eventFired = false;
            var tab = null;

            suggestList._suggestListOptions = {
               tabsSelectedKey: null
            };

            suggestList._notify = function(event, id) {
               eventFired = true;
               tab = id[0];
            };

            it('default', function() {
               suggestList._beforeUpdate(optionsObject);

               assert.isFalse(eventFired);
               assert.equal(tab, null);
            });

            it('with new tab key', function() {
               suggestList._beforeUpdate(optionsObjectWithNewKey);

               assert.isTrue(eventFired);
               assert.equal(tab, 'test');
            });
         });

         describe('_beforeMount', () => {
            it('items from sourceController is saved on beforeMount', () => {
               const suggestList = new SuggestPopupListContainer();
               const sourceController = new dataSource.NewSourceController({
                  source: new sourceLib.Memory()
               });
               sourceController.setItems(getSuggestItems());

               const optionsObject = {
                  _suggestListOptions: {
                     sourceController
                  }
               };

               suggestList._beforeMount(optionsObject);
               assert.deepStrictEqual(suggestList._items.getRawData(), getSuggestItems().getRawData());
            });
         });

         it('_tabsSelectedKeyChanged', function() {
            var suggestList = new SuggestPopupListContainer();
            var tab = null;
            suggestList._suggestListOptions = {
               tabsSelectedKeyChangedCallback: function(newtab) {
                  tab = newtab;
               }
            };

            suggestList._tabsSelectedKeyChanged(null, 'test');
            assert.equal(tab, 'test');
         });

         it('tabsSelectedKeyChanged with promise from event', async function() {
            const sourceController = new dataSource.NewSourceController({
               source: new sourceLib.Memory()
            });
            const optionsObject = {
               _suggestListOptions: {
                  tabsSelectedKey: null,
                  sourceController
               }
            };
            const optionsObjectWithNewKey = {
               _suggestListOptions: {
                  tabsSelectedKey: 'test',
                  sourceController
               }
            };
            const suggestList = new SuggestPopupListContainer();
            suggestList._beforeMount(optionsObject);
            suggestList.saveOptions(optionsObject);
            const sandBox = sinon.createSandbox();
            const promise = Promise.resolve();
            sandBox.replace(suggestList, '_notify', () => {
               return promise;
            });

            suggestList._beforeUpdate(optionsObjectWithNewKey);
            assert.ok(suggestList._tabsChangedPromise === promise);

            await promise;
            assert.ok(suggestList._tabsChangedPromise === null);
         });

         it('isTabChanged', function() {
            assert.isTrue(SuggestPopupListContainer._private.isTabChanged({tabsSelectedKey: 1}, 2));
            assert.isFalse(SuggestPopupListContainer._private.isTabChanged({tabsSelectedKey: 1}, 1));
         });

         it('dispatchEvent', function() {
            var eventDispatched = false;
            var container = {
               dispatchEvent: function(event) {
                  assert.equal(event.keyCode, 'testKeyCode');
                  eventDispatched = true;
               }
            }

            SuggestPopupListContainer._private.dispatchEvent(container, {keyCode: 'testKeyCode'}, {});
            assert.isTrue(eventDispatched);
         });

         it('getTabKeyFromContext', function() {
            var emptyContext = {};
            var contextWithValue = {
               _suggestListOptions: {
                  tabsSelectedKey: 1
               }
            };

            assert.equal(SuggestPopupListContainer._private.getTabKeyFromContext(emptyContext), null);
            assert.equal(SuggestPopupListContainer._private.getTabKeyFromContext(contextWithValue), 1);
         });

         describe('_inputKeydown, markedKey is null', function() {
            var
               suggestList = new SuggestPopupListContainer(),
               domEvent = {
                  nativeEvent: {
                     keyCode: Env.constants.key.up
                  }
               };

            suggestList._options = {
               keyProperty: 'id'
            };
            suggestList._items = new collection.List({
               items: [
                  new entity.Model({
                     rawData: {id: 'first'},
                     keyProperty: 'id'
                  }),
                  new entity.Model({
                     rawData: {id: 'last'},
                     keyProperty: 'id'
                  })
               ]
            });

            it('list is not reverse', function() {
               suggestList._inputKeydown(null, domEvent);
               assert.equal(suggestList._markedKey, 'last');
            });

            it('list is reverse', function() {
               suggestList._reverseList = true;
               suggestList._markedKey = null;
               suggestList._inputKeydown(null, domEvent);
               assert.equal(suggestList._markedKey, 'last');
            });
         });

         it('_private:checkContext', function() {
            let suggestList = new SuggestPopupListContainer();
            let optionsObject = {
               _suggestListOptions: {
                  dialogMode: true
               }
            };

            SuggestPopupListContainer._private.checkContext(suggestList, optionsObject);
            assert.isTrue(suggestList._navigation === undefined);

            optionsObject._suggestListOptions.navigation = {
               source: 'page',
               view: 'page',
               sourceConfig: {
                  pageSize: 2,
                  page: 0
               }
            };
            let expectedNavigation = {
               source: 'page',
               view: 'infinity',
               viewConfig: {
                  pagingMode: true
               },
               sourceConfig: {
                  pageSize: 25,
                  page: 0
               }
            };
            SuggestPopupListContainer._private.checkContext(suggestList, optionsObject);
            assert.deepStrictEqual(suggestList._navigation, expectedNavigation);
         });

         describe('collectionChange', () => {

            it('maxCount navigation', () => {
               const suggestList = new SuggestPopupListContainer();
               const suggestOptions = {
                  _suggestListOptions: {
                     navigation: {
                        view: 'maxCount'
                     }
                  }
               };
               const suggestItems = getSuggestItems();
               const sandbox = sinon.createSandbox();
               const notifyStub = sandbox.stub(suggestList, '_notify');
               suggestList._beforeMount(suggestOptions);
               suggestList._itemsReadyCallback(suggestItems);
               assert.isFalse(suggestList._isSuggestListEmpty);

               suggestItems.clear();
               suggestItems.setMetaData({
                  results: new entity.Model({
                     rawData: {tabsSelectedKey: 'test'}
                  })
               });
               suggestList._collectionChange();
               assert.isTrue(suggestList._isSuggestListEmpty);
               assert.isTrue(suggestList._suggestListOptions.tabsSelectedKey === 'test');
               assert.isTrue(notifyStub.withArgs('tabsSelectedKeyChanged', ['test']).calledOnce);
               sandbox.restore();
            });

         });

      });
   }
);
