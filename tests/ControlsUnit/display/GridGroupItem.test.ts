import { assert } from 'chai';
import {GridGroupItem as GroupItem} from 'Controls/gridNew';

describe('Controls/_display/grid/GroupItem', () => {
   describe('isSticked', () => {
      it('sticky enabled', () => {
         const owner = { isStickyHeader: () => true, getColumnsConfig: () => [] };
         const item = new GroupItem({owner});
         assert.isTrue(item.isSticked());
      });

      it('sticky disabled', () => {
         const owner = { isStickyHeader: () => false, getColumnsConfig: () => [] };
         const item = new GroupItem({owner});
         assert.isFalse(item.isSticked());
      });

      it('hidden group', () => {
         const owner = { isStickyHeader: () => true, getColumnsConfig: () => [] };
         const item = new GroupItem({owner, contents: 'CONTROLS_HIDDEN_GROUP'});
         assert.isFalse(item.isSticked());
      });
   });
});
