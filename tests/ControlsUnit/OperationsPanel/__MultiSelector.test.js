define([
   'Controls/_operations/__MultiSelector'
], function(
   MultiSelector
) {
   'use strict';
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

         it('selectedKeys is [null]]', async() => {
            instance = new MultiSelector.default();
            selectedKeys = [null];
            excludedKeys = [];
            selectedKeysCount = 0;
            await instance._updateMenuCaptionByOptions({
               selectedKeys: selectedKeys,
               excludedKeys: excludedKeys,
               selectedKeysCount: selectedKeysCount,
               isAllSelected: true
            });
            assert.equal(instance._menuCaption, 'Отмечено всё');
         });

         it('selectedKeys is []', async() => {
            instance = new MultiSelector.default();
            selectedKeys = [];
            excludedKeys = [];
            selectedKeysCount = 0;
            await instance._updateMenuCaptionByOptions({
               selectedKeys: selectedKeys,
               excludedKeys: excludedKeys,
               selectedKeysCount: selectedKeysCount,
               isAllSelected: false
            });
            assert.equal(instance._menuCaption, 'Отметить');
         });

         it('selectedKeys is [null]]', async() => {
            instance = new MultiSelector.default();
            selectedKeys = [null];
            excludedKeys = [];
            selectedKeysCount = 0;
            await instance._updateMenuCaptionByOptions({
               selectedKeys: selectedKeys,
               excludedKeys: excludedKeys,
               selectedKeysCount: selectedKeysCount,
               isAllSelected: true
            });
            assert.equal(instance._menuCaption, 'Отмечено всё');
         });

         it('selectedKeys is [1, 2], selectedKeysCount is 2', async() => {
            instance = new MultiSelector.default();
            excludedKeys = [];
            selectedKeys = [1, 2];
            selectedKeysCount = 2;
            await instance._updateMenuCaptionByOptions({
               selectedKeys: selectedKeys,
               excludedKeys: excludedKeys,
               selectedKeysCount: selectedKeysCount,
               isAllSelected: false
            });
            assert.equal(instance._menuCaption, 'Отмечено: 2');
         });

         it('selectedKeys is [1, 2], selectedKeysCount is undefined', async() => {
            instance = new MultiSelector.default();
            excludedKeys = [];
            selectedKeys = [1, 2];
            selectedKeysCount = undefined;
            await instance._updateMenuCaptionByOptions({
               selectedKeys: selectedKeys,
               excludedKeys: excludedKeys,
               selectedKeysCount: selectedKeysCount,
               isAllSelected: false
            });
            assert.equal(instance._menuCaption, 'Отмечено: 2');
         });

         it('selectedKeys is [null], excludedeKeys is [1,2,3] selectedKeysCount is 1', async() => {
            instance = new MultiSelector.default();
            selectedKeys = [null];
            excludedKeys = [1, 2, 3];
            selectedKeysCount = 1;
            await instance._updateMenuCaptionByOptions({
               selectedKeys: selectedKeys,
               excludedKeys: excludedKeys,
               selectedKeysCount: selectedKeysCount,
               isAllSelected: false
            });
            assert.equal(instance._menuCaption, 'Отмечено: 1');
         });

         it('selectedKeys is [null], excludedeKeys is [1,2,3] selectedKeysCount is 1', async() => {
            instance = new MultiSelector.default();
            selectedKeys = [null];
            excludedKeys = [1, 2, 3, 4];
            selectedKeysCount = 0;
            await instance._updateMenuCaptionByOptions({
               selectedKeys: selectedKeys,
               excludedKeys: excludedKeys,
               selectedKeysCount: selectedKeysCount,
               isAllSelected: false
            });
            assert.equal(instance._menuCaption, 'Отметить');
         });

         it('selectedKeys is [null], excludedeKeys is [1,2,3] selectedKeysCount is 1', async() => {
            instance = new MultiSelector.default();
            excludedKeys = [];
            selectedKeys = [];
            selectedKeysCount = 1;
            await instance._updateMenuCaptionByOptions({
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
      it('_beforeMount', async() => {
         var instance = new MultiSelector.default();
         var newOptions = {
            selectedKeys: [null],
            excludedKeys: [],
            selectedKeysCount: 0,
            isAllSelected: true
         };
         await instance._beforeMount(newOptions);
         assert.equal(instance._menuSource._$data.length, 3);
         assert.equal(instance._menuCaption, 'Отмечено всё');
         newOptions.isAllSelected = false;

         await instance._beforeMount(newOptions);
         assert.equal(instance._menuCaption, 'Отметить');
         newOptions.selectedKeys = [1, 2];
         newOptions.selectedKeysCount = 2;

         await instance._beforeMount(newOptions);
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
         let isUpdateMenu = false;

         instance._getMenuSource = () =>  isUpdateMenu = true;
         await instance._beforeUpdate(newOptions);
         assert.equal(instance._menuCaption, 'Отмечено всё');
         assert.isTrue(isUpdateMenu);

         isUpdateMenu = false;
         newOptions.isAllSelected = false;
         await instance._beforeUpdate(newOptions);
         assert.equal(instance._menuCaption, 'Отметить');
         assert.isTrue(isUpdateMenu);

         newOptions.selectedKeys = [1, 2];
         newOptions.selectedKeysCount = 2;
         await instance._beforeUpdate(newOptions);
         assert.equal(instance._menuCaption, 'Отмечено: 2');

         isUpdateMenu = false;
         instance._beforeUpdate(instance._options);
         assert.isFalse(isUpdateMenu);

         newOptions.withShowSelected = true;
         instance._beforeUpdate(newOptions);
         assert.isTrue(isUpdateMenu);
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
   });
});
