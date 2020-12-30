import { RecordSet } from 'Types/collection';
import Collection from 'Controls/_display/grid/Collection';
import { assert } from 'chai';

describe('Controls/_display/grid/Collection', () => {
   const recordSet = new RecordSet({
      rawData: [{
         id: 1,
         title: '1',
         description: 'one'
      }, {
         id: 2,
         title: '2',
         description: 'two'
      }, {
         id: 3,
         title: '3',
         description: 'three'
      }],
      keyProperty: 'id'
   });

   const gridCollection = new Collection({
      collection: recordSet,
      keyProperty: 'id',
      columns: [{
         displayProperty: 'title',
         width: '300px',
         template: 'wml!template1'
      }, {
         displayProperty: 'description',
         width: '200px',
         template: 'wml!template2'
      }]
   });

   it('.setFooter()', () => {
      assert.isNotOk(gridCollection.getFooter());
      gridCollection.setFooter(() => 'template', []);
      assert.isOk(gridCollection.getFooter());

      assert.equal(gridCollection.getVersion(), 1);
      gridCollection.setFooter(() => 'template2', []);
      assert.isOk(gridCollection.getFooter());
      assert.equal(gridCollection.getVersion(), 2);
   });
});
