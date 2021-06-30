import { assert } from 'chai';
import {GridGroupRow as GroupItem} from 'Controls/grid';

describe('Controls/_display/grid/GroupItem', () => {
   describe('isSticked', () => {
      it('sticky enabled', () => {
         const owner = { isStickyHeader: () => true, getGridColumnsConfig: () => [] };
         const item = new GroupItem({owner});
         assert.isTrue(item.isSticked());
      });

      it('sticky disabled', () => {
         const owner = { isStickyHeader: () => false, getGridColumnsConfig: () => [] };
         const item = new GroupItem({owner});
         assert.isFalse(item.isSticked());
      });

      it('hidden group', () => {
         const owner = { isStickyHeader: () => true, getGridColumnsConfig: () => [] };
         const item = new GroupItem({owner, contents: 'CONTROLS_HIDDEN_GROUP'});
         assert.isFalse(item.isSticked());
      });
   });
});
