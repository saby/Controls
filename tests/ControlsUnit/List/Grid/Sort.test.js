define(['Controls/grid', 'Types/source'], function(grid, TypesSource) {
   describe('Controls.grid:SortingSelector', function() {
      const sortingParams = [
         {
            paramName: null,
            title: 'none'
         },
         {
            paramName: 'F',
            title: 'first'
         },
         {
            paramName: 'S',
            title: 'second'
         }];
      const sorting = [{ 'F': 'ASC' }];
      const cfg = { value: sorting, sortingParams: sortingParams };
      const sortingSelector = new grid.SortingSelector(cfg);
      let menuClosed = false;
      sortingSelector._notify = (eventName, args) => {
         cfg.value = args[0];
      };
      sortingSelector._children = {
         dropdown: {
            closeMenu: () => {
               menuClosed = true;
            }
         }
      };

      it('initial configurating', function() {
         sortingSelector._beforeMount(cfg);
         sortingSelector.saveOptions({...cfg});
         assert.deepEqual(sortingSelector._selectedKeys, [1]);
         assert.deepEqual(sortingSelector._currentParamName, 'F');
         assert.deepEqual(sortingSelector._currentOrder, 'ASC');
      });

      it('_switchSorting', function() {
         menuClosed = false;
         sortingSelector._switchValue();
         sortingSelector.__beforeUpdate(cfg);
         assert.deepEqual(sortingSelector._selectedKeys, [1]);
         assert.deepEqual(sortingSelector._currentParamName, 'F');
         assert.deepEqual(sortingSelector._currentOrder, 'DESC');
         sortingSelector._afterUpdate();
         menuClosed = false;
      });

      it('_itemArrowClick', function() {
         const item = {
            id: 2,
            paramName: 'S',
            get: (prop) => {
               return item[prop];
            }
         };
         assert.isFalse(menuClosed);
         sortingSelector._itemClick({}, item);
         sortingSelector.__beforeUpdate(cfg);
         assert.deepEqual(sortingSelector._selectedKeys, [2]);
         assert.deepEqual(sortingSelector._currentParamName, 'S');
         assert.deepEqual(sortingSelector._currentOrder, 'ASC');
         assert.isTrue(menuClosed);
      });
      it('_selectedKeysChangedHandler', function() {
         assert.isFalse(sortingSelector._selectedKeysChangedHandler({},[1]));
         sortingSelector._selectedKeysChangedHandler({},[0]);
         sortingSelector.__beforeUpdate(cfg);
         assert.deepEqual(sortingSelector._selectedKeys, [0]);
         assert.deepEqual(sortingSelector._currentParamName, null);
         assert.deepEqual(sortingSelector._currentOrder, null);
      });
   });
});
