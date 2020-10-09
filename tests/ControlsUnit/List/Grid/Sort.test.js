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
         assert.deepEqual(sortingSelector._selectedKeys, ['F']);
         assert.deepEqual(sortingSelector._currentParamName, 'F');
         assert.deepEqual(sortingSelector._orders[sortingSelector._currentParamName], 'ASC');
      });

      it('_switchSorting', function() {
         menuClosed = false;
         sortingSelector._beforeMount(cfg);
         sortingSelector.saveOptions({...cfg});
         sortingSelector._switchValue();
         sortingSelector.__beforeUpdate(cfg);
         assert.deepEqual(sortingSelector._selectedKeys, ['F']);
         assert.deepEqual(sortingSelector._currentParamName, 'F');
         assert.deepEqual(sortingSelector._orders[sortingSelector._currentParamName], 'DESC');
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
         sortingSelector._dropdownItemClick({}, 'S');
         sortingSelector.__beforeUpdate(cfg);
         assert.deepEqual(sortingSelector._selectedKeys, ['S']);
         assert.deepEqual(sortingSelector._currentParamName, 'S');
         assert.deepEqual(sortingSelector._orders[sortingSelector._currentParamName], 'ASC');
         assert.isTrue(menuClosed);
      });
   });
});
