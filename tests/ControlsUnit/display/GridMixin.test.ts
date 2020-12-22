import { assert } from 'chai';
import { GridCollection } from 'Controls/display';

describe('Controls/_display/GridMixin', () => {
   const grid = new GridCollection({collection: [{id: 1}]});

   it('needMultiSelectColumn()', () => {
      grid.setMultiSelectVisibility('visible');
      grid.setMultiSelectPosition('default');
      assert.isTrue(grid.needMultiSelectColumn());

      grid.setMultiSelectVisibility('onactivated');
      grid.setMultiSelectPosition('default');
      assert.isTrue(grid.needMultiSelectColumn());

      grid.setMultiSelectVisibility('hidden');
      grid.setMultiSelectPosition('default');
      assert.isFalse(grid.needMultiSelectColumn());

      grid.setMultiSelectVisibility('visible');
      grid.setMultiSelectPosition('custom');
      assert.isFalse(grid.needMultiSelectColumn());

      grid.setMultiSelectVisibility('onactivated');
      grid.setMultiSelectPosition('custom');
      assert.isFalse(grid.needMultiSelectColumn());

      grid.setMultiSelectVisibility('hidden');
      grid.setMultiSelectPosition('custom');
      assert.isFalse(grid.needMultiSelectColumn());
   });
});
