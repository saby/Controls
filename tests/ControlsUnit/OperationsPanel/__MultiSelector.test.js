define([
   'Controls/_operations/__MultiSelector',
   'Types/entity'
], function(
   MultiSelector,
   entity
) {
   'use strict';

   const testSelectedItemsCount = 5;
   const selectionCountConfig = {
      rpc: {
         call: () => {
            return Promise.resolve({
               getRow: () => {
                  return {
                     get: () => testSelectedItemsCount
                  };
               }
            });
         },
         getAdapter: () => {
            return new entity.adapter.Json();
         }
      }
   };

   describe('Controls.OperationsPanel.__MultiSelector', function() {
      var eventQueue;
      function mockNotify(returnValue) {
         return function(event, eventArgs, eventOptions) {
            eventQueue.push({
               event: event,
               eventArgs: eventArgs,
               eventOptions: eventOptions
            });
            return returnValue;
         };
      }

      beforeEach(function() {
         eventQueue = [];
      });

      describe('_updateSelection', function() {
         var selectedKeys, excludedKeys, selectedKeysCount, instance;

         it('selectedKeys is [null]]', () => {
            instance = new MultiSelector.default();
            selectedKeys = [null];
            excludedKeys = [];
            selectedKeysCount = 0;
            instance._updateMenuCaptionByOptions({
               selectedKeys: selectedKeys,
               excludedKeys: excludedKeys,
               selectedKeysCount: selectedKeysCount,
               isAllSelected: true
            });
            assert.equal(instance._menuCaption, 'Отмечено все');
         });

         it('selectedKeys is []', () => {
            instance = new MultiSelector.default();
            selectedKeys = [];
            excludedKeys = [];
            selectedKeysCount = 0;
            instance._updateMenuCaptionByOptions({
               selectedKeys: selectedKeys,
               excludedKeys: excludedKeys,
               selectedKeysCount: selectedKeysCount,
               isAllSelected: false
            });
            assert.equal(instance._menuCaption, 'Отметить');

            instance._updateMenuCaptionByOptions({
               selectedKeys: selectedKeys,
               excludedKeys: excludedKeys,
               selectedKeysCount: selectedKeysCount,
               isAllSelected: true
            });
            assert.equal(instance._menuCaption, 'Отметить');
         });

         it('selectedKeys is [null]]', () => {
            instance = new MultiSelector.default();
            selectedKeys = [null];
            excludedKeys = [];
            selectedKeysCount = 0;
            instance._updateMenuCaptionByOptions({
               selectedKeys: selectedKeys,
               excludedKeys: excludedKeys,
               selectedKeysCount: selectedKeysCount,
               isAllSelected: true
            });
            assert.equal(instance._menuCaption, 'Отмечено все');
         });

         it('selectedKeys is [1, 2], selectedKeysCount is 2', () => {
            instance = new MultiSelector.default();
            excludedKeys = [];
            selectedKeys = [1, 2];
            selectedKeysCount = 2;
            instance._updateMenuCaptionByOptions({
               selectedKeys: selectedKeys,
               excludedKeys: excludedKeys,
               selectedKeysCount: selectedKeysCount,
               isAllSelected: false
            });
            assert.equal(instance._menuCaption, 'Отмечено: 2');
         });

         it('selectedKeys is [1, 2], selectedKeysCount is undefined', () => {
            instance = new MultiSelector.default();
            excludedKeys = [];
            selectedKeys = [1, 2];
            selectedKeysCount = undefined;
            instance._updateMenuCaptionByOptions({
               selectedKeys: selectedKeys,
               excludedKeys: excludedKeys,
               selectedKeysCount: selectedKeysCount,
               isAllSelected: false
            });
            assert.equal(instance._menuCaption, 'Отмечено: 2');
         });

         it('selectedKeys is [null], excludedeKeys is [1,2,3] selectedKeysCount is 1', () => {
            instance = new MultiSelector.default();
            selectedKeys = [null];
            excludedKeys = [1, 2, 3];
            selectedKeysCount = 1;
            instance._updateMenuCaptionByOptions({
               selectedKeys: selectedKeys,
               excludedKeys: excludedKeys,
               selectedKeysCount: selectedKeysCount,
               isAllSelected: false
            });
            assert.equal(instance._menuCaption, 'Отмечено: 1');
         });

         it('selectedKeys is [null], excludedeKeys is [1,2,3] selectedKeysCount is 1', () => {
            instance = new MultiSelector.default();
            selectedKeys = [null];
            excludedKeys = [1, 2, 3, 4];
            selectedKeysCount = 0;
            instance._updateMenuCaptionByOptions({
               selectedKeys: selectedKeys,
               excludedKeys: excludedKeys,
               selectedKeysCount: selectedKeysCount,
               isAllSelected: false
            });
            assert.equal(instance._menuCaption, 'Отметить');
         });

         it('selectedKeys is [null], excludedeKeys is [1,2,3] selectedKeysCount is 1', () => {
            instance = new MultiSelector.default();
            excludedKeys = [];
            selectedKeys = [];
            selectedKeysCount = 1;
            instance._updateMenuCaptionByOptions({
               selectedKeys: selectedKeys,
               excludedKeys: excludedKeys,
               selectedKeysCount: selectedKeysCount,
               isAllSelected: false
            });
            assert.equal(instance._menuCaption, 'Отметить');
         });
      });
      it('_getMenuSource', function() {
         let instance = new MultiSelector.default();
         let options = MultiSelector.default.getDefaultOptions();

         assert.equal(instance._getMenuSource(options)._$data.length, 3);

         options.selectionViewMode = 'selected';
         assert.equal(instance._getMenuSource(options)._$data.length, 4);

         options.selectionViewMode = 'all';
         options.selectedKeys = [1, 2, 3];
         assert.equal(instance._getMenuSource(options)._$data.length, 4);
      });
      it('_onMenuItemActivate', function() {
         let instance = new MultiSelector.default();
         let idItemMenu = 'selectAll';
         let recordMenu = {
            get: function() {
               return idItemMenu;
            }
         };

         instance._options = MultiSelector.default.getDefaultOptions();
         instance._notify = function(eventName, argumentsArray) {
            assert.equal(argumentsArray[0], idItemMenu);
            assert.equal(eventName, 'selectedTypeChanged');
         };
         instance._onMenuItemActivate({}, recordMenu);

         idItemMenu = 'showSelected';
         instance._onMenuItemActivate({}, recordMenu);
      });
      it('_beforeMount', () => {
         var instance = new MultiSelector.default();
         var newOptions = {
            selectedKeys: [null],
            excludedKeys: [],
            selectedKeysCount: 0,
            isAllSelected: true
         };
         instance._beforeMount(newOptions);
         assert.equal(instance._menuSource._$data.length, 3);
         assert.equal(instance._menuCaption, 'Отмечено все');

         newOptions.isAllSelected = false;
         instance._beforeMount(newOptions);
         assert.equal(instance._menuCaption, 'Отметить');

         newOptions.selectedKeys = [1, 2];
         newOptions.selectedKeysCount = 2;

         instance._beforeMount(newOptions);
         assert.equal(instance._menuCaption, 'Отмечено: 2');
      });
      it('_beforeUpdate', async() => {
         let instance = new MultiSelector.default();
         let newOptions = {
            selectedKeys: [null],
            excludedKeys: [],
            selectedKeysCount: 0,
            isAllSelected: true
         };
         let isMenuUpdated = false;

         instance._getMenuSource = () =>  isMenuUpdated = true;
         await instance._beforeUpdate(newOptions);
         assert.equal(instance._menuCaption, 'Отмечено все');
         assert.isTrue(isMenuUpdated);
         instance.saveOptions({ ...newOptions });

         isMenuUpdated = false;
         newOptions.isAllSelected = false;
         await instance._beforeUpdate(newOptions);
         assert.equal(instance._menuCaption, 'Отметить');
         assert.isTrue(isMenuUpdated);
         instance.saveOptions({ ...newOptions });

         newOptions.selectedKeys = [1, 2];
         newOptions.selectedKeysCount = 2;
         await instance._beforeUpdate(newOptions);
         assert.equal(instance._menuCaption, 'Отмечено: 2');
         instance.saveOptions({ ...newOptions });

         isMenuUpdated = false;
         instance._beforeUpdate(instance._options);
         assert.isFalse(isMenuUpdated);

         newOptions.isAllSelected = true;
         newOptions.selectedKeys = [1, 2];
         newOptions.selectedKeysCount = 0;
         newOptions.selectedCountConfig = selectionCountConfig;
         instance._beforeUpdate(instance._options);
         assert.equal(instance._menuCaption, 'Отмечено: 2');
         instance._beforeUpdate(instance._options);
         assert.equal(instance._menuCaption, 'Отмечено: 2');
      });

      it('_beforeUpdate with new selectionCountConfig, selectedKeysCount = 0', () => {
         let instance = new MultiSelector.default();
         let newOptions = {
            selectedKeys: ['anyKey'],
            excludedKeys: [],
            selectedKeysCount: 0,
            isAllSelected: false
         };
         instance._beforeMount(newOptions);
         instance.saveOptions(newOptions);

         newOptions = {...newOptions};
         newOptions.selectionCountConfig = {
            rpc: {
               call: () => {},
               getAdapter: () => {}
            }
         };
         instance._beforeUpdate(newOptions);
         assert.equal(instance._menuCaption, 'Отметить');
      });

      it('_beforeUpdate with old selectionCountConfig', () => {
         let menuCaptionUpdated = false;
         let instance = new MultiSelector.default();

         instance._updateMenuCaptionByOptions = () => {
            menuCaptionUpdated = true;
         };
         instance._options = {
            selectionCountConfig: {
               command: 'ListCounter'
            }
         };
         const newOptions = {
            selectionCountConfig: {
               command: 'ListCounter'
            }
         };
         instance._beforeUpdate(newOptions);
         assert.isFalse(menuCaptionUpdated);
      });

      it('_afterUpdate', function() {
         var instance = new MultiSelector.default();
         instance._notify = mockNotify();
         instance._afterUpdate();
         assert.equal(eventQueue.length, 0);
         instance._sizeChanged = true;
         instance._afterUpdate();
         assert.equal(eventQueue.length, 1);
         assert.equal(eventQueue[0].event, 'controlResize');
         assert.equal(eventQueue[0].eventArgs.length, 0);
         assert.isTrue(eventQueue[0].eventOptions.bubbling);
      });

      describe('_getCount', () => {
         const selection = {
            selected: ['test'],
            excluded: []
         };
         let instance;

         beforeEach(() => {
            instance = new MultiSelector.default();
            instance._options.selectedCountConfig = selectionCountConfig;
            instance._children = {
               countIndicator: {
                  show: function () {},
                  hide: function () {}
               }
            };
         });

         it('_getCount returns promise<count>', () => {
            return new Promise((resolve) => {
               instance._getCount(selection, null, selectionCountConfig).then((count) => {
                  assert.equal(count, testSelectedItemsCount);
                  resolve();
               });
            });
         });

         it('promise is canceled on second getCount call', () => {
            let isCountPromiseCanceled = false;
            instance._getCount(selection, null, selectionCountConfig);
            instance._countPromise.cancel = () => {
               isCountPromiseCanceled = true;
            };
            instance._getCount(selection, null, selectionCountConfig);
            assert.isTrue(isCountPromiseCanceled);
         });

         it('promise is canceled and reset', () => {
            let isCountPromiseCanceled = false;
            instance._getCount(selection, null, selectionCountConfig);
            instance._countPromise.cancel = () => {
               isCountPromiseCanceled = true;
            };
            instance._getCount(selection, 6, selectionCountConfig);
            assert.isTrue(isCountPromiseCanceled);
            assert.isNull(instance._countPromise);
         });

         it('promise is canceled on _beforeUnmount', () => {
            let isCountPromiseCanceled = false;
            instance._getCount(selection, null, selectionCountConfig);
            instance._countPromise.cancel = () => {
               isCountPromiseCanceled = true;
            };
            instance._beforeUnmount();
            assert.isTrue(isCountPromiseCanceled);
            assert.isNull(instance._countPromise);
         });
      });
   });
});
