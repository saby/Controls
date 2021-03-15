import { SearchGridCollection} from 'Controls/searchBreadcrumbsGrid';
import { assert } from 'chai';
import getRecordSet from 'ControlsUnit/searchBreadcrumbsGrid/display/getRecordSet';

describe('Controls/_searchBreadcrumbsGrid/display/BreadcrumbsItemRow', () => {
   const searchGridCollection = new SearchGridCollection({
      collection: getRecordSet(),
      root: null,
      keyProperty: 'id',
      parentProperty: 'parent',
      nodeProperty: 'node',
      columns: [{
         displayProperty: 'title',
         width: '300px',
         template: 'wml!template1'
      }, {
         displayProperty: 'taxBase',
         width: '200px',
         template: 'wml!template1'
      }]
   });

   describe('getCellTemplate', () => {
      it('getCellTemplate', () => {
         const item = searchGridCollection.at(0);
         assert.equal(item.getCellTemplate(), 'Controls/searchBreadcrumbsGrid:SearchBreadcrumbsItemTemplate');
      });
   });

   describe('getLevel', () => {
      it('getLevel', () => {
         const item = searchGridCollection.at(0);
         assert.equal(item.getLevel(), 1);
      });
   });

   describe('getTemplate', () => {
      it('getTemplate', () => {
         const item = searchGridCollection.at(0);
         assert.equal(item.getTemplate(), 'Controls/gridNew:ItemTemplate');
      });
   });

   describe('getParent', () => {
      it('getParent', () => {
         const item = searchGridCollection.at(0);
         assert.isTrue(item.getParent().isRoot());
      });
   });
});
