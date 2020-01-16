define([
   'Controls/_list/BaseControl/SelectionController',
   'Types/collection',
   'Types/entity',
   'Controls/operations',
   'Controls/list',
   'ControlsUnit/ListData'
], function(
   SelectionController,
   collection,
   entity,
   operations,
   list,
   ListData
) {
   'use strict';
   describe('Controls.List.BaseControl.SelectionControllerWithLimit', function() {
      var
         instance,
         rs,
         cfg,
         sandbox;

      beforeEach(function() {
         sandbox = sinon.createSandbox();
         rs = new collection.RecordSet({
            keyProperty: ListData.KEY_PROPERTY,
            rawData: ListData.getFlatItems()
         });
         cfg = {
            selectedKeys: [],
            excludedKeys: [],
            items: rs,
            keyProperty: ListData.KEY_PROPERTY,
            selectionStrategy: {
               name: 'Controls/operations:FlatSelectionStrategy'
            },
            listModel: new list.ListViewModel({items: rs})
         };
         instance = new SelectionController();
         instance.saveOptions(cfg);
      });

      afterEach(function() {
         sandbox.restore();
      });

      it('select all with limit', async function() {
         await instance._beforeMount(cfg);
         const stubSetLimit = sandbox.stub(instance._multiselection, 'setLimit');
         const stubSelectAll = sandbox.stub(instance._multiselection, 'selectAll');
         SelectionController._private.selectedTypeChangedHandler.call(instance, 'selectAll', 3);
         assert.isTrue(stubSetLimit.withArgs(3).calledOnce);
         assert.isTrue(stubSelectAll.calledOnce);
      });

      it('exclude item with limit', async function() {
         await instance._beforeMount(cfg);
         SelectionController._private.selectedTypeChangedHandler.call(instance, 'selectAll', 3);
         instance.onCheckBoxClick(2, true);
         assert.isTrue(instance._multiselection._excludedKeys.includes(2));
      });

      it('increase limit on select', async function() {
         await instance._beforeMount(cfg);
         const stubExpandLimit = sandbox.stub(instance._multiselection, '_increaseLimit');
         SelectionController._private.selectedTypeChangedHandler.call(instance, 'selectAll', 3);
         instance.onCheckBoxClick(7, false);
         assert.isTrue(stubExpandLimit.withArgs([7]).calledOnce);
      });

      it('call _increaseLimit on select', async function() {
         await instance._beforeMount(cfg);
         const stubExpandLimit = sandbox.stub(instance._multiselection, '_increaseLimit');
         SelectionController._private.selectedTypeChangedHandler.call(instance, 'selectAll', 3);
         instance.onCheckBoxClick(7, false);
         assert.isTrue(stubExpandLimit.withArgs([7]).calledOnce);
      });

      it('incrace limit', async function() {
         await instance._beforeMount(cfg);
         SelectionController._private.selectedTypeChangedHandler.call(instance, 'selectAll', 3);
         instance.onCheckBoxClick(7, false);
         assert.isTrue(instance._multiselection._limit === 7);
         assert.deepEqual(instance._multiselection._excludedKeys, [4, 5, 6]);
      });

      it('getCount with isAllItemsLoaded == true', async function() {
         await instance._beforeMount(cfg);
         const stubExpandLimit = sandbox.stub(instance._multiselection, '_increaseLimit');
         SelectionController._private.selectedTypeChangedHandler.call(instance, 'selectAll', 100);
         assert.equal(instance._multiselection.getCount(), 7);
      });

      it('getCount with isAllItemsLoaded == false', async function() {
         await instance._beforeMount(cfg);
         const stubExpandLimit = sandbox.stub(instance._multiselection, '_increaseLimit');
         instance._multiselection._selectionStrategy._isAllItemsLoaded = function() {
            return false;
         };
         SelectionController._private.selectedTypeChangedHandler.call(instance, 'selectAll', 100);
         assert.equal(instance._multiselection.getCount(), 100);
      });
   });
});
