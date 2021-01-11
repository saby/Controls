import { RecordSet } from 'Types/collection';
import { TreeGridCollection } from 'Controls/treeGridNew';
import { assert } from 'chai';
import { CssClassesAssert } from 'ControlsUnit/CustomAsserts';
import TreeGridNodeFooterRow from 'Controls/_treeGridNew/display/TreeGridNodeFooterRow';

describe('Controls/_treeGridNew/display/TreeGridNodeFooterRow', () => {
   const recordSet = new RecordSet({
      rawData: [{
         id: 1,
         parent: null,
         node: true,
         hasChildren: true
      }, {
         id: 2,
         parent: 1,
         node: false,
         hasChildren: false
      }, {
         id: 3,
         parent: 2,
         node: false,
         hasChildren: false
      }, {
         id: 4,
         parent: 2,
         node: null,
         hasChildren: false
      }, {
         id: 5,
         parent: 1,
         node: null,
         hasChildren: false
      }, {
         id: 6,
         parent: null,
         node: true,
         hasChildren: false
      }, {
         id: 7,
         parent: null,
         node: null,
         hasChildren: false
      }],
      keyProperty: 'id'
   });

   const treeGridCollection = new TreeGridCollection({
      collection: recordSet,
      root: null,
      keyProperty: 'id',
      parentProperty: 'parent',
      nodeProperty: 'node',
      hasChildrenProperty: 'hasChildren',
      columns: [{
         displayProperty: 'title',
         width: '300px',
         template: 'wml!template1'
      },
         {
            displayProperty: 'taxBase',
            width: '200px',
            template: 'wml!template1'
         }
      ],
      expandedItems: [null]
   });
   const nodeFooterRow = treeGridCollection.at(3) as TreeGridNodeFooterRow;

   it('.getColumns()', () => {
      let columns = nodeFooterRow.getColumns(false);
      assert.equal(columns.length, 2);

      columns = nodeFooterRow.getColumns(true);
      assert.equal(columns.length, 1);

      columns = nodeFooterRow.getColumns();
      assert.equal(columns.length, 1);
   });

   it('.getItemClasses()', () => {
      CssClassesAssert.isSame(nodeFooterRow.getItemClasses(), 'controls-Grid__row controls-TreeGrid__nodeFooter');
   });

   it('.getExpanderPaddingClasses()', () => {
      CssClassesAssert.isSame(nodeFooterRow.getExpanderPaddingClasses(), 'controls-TreeGrid__row-expanderPadding controls-TreeGrid__node-footer-expanderPadding_theme-default controls-TreeGrid__row-expanderPadding_size_default_theme-default js-controls-ListView__notEditable');
      CssClassesAssert.isSame(nodeFooterRow.getExpanderPaddingClasses('s'), 'controls-TreeGrid__row-expanderPadding controls-TreeGrid__node-footer-expanderPadding_theme-default controls-TreeGrid__row-expanderPadding_size_s_theme-default js-controls-ListView__notEditable');
      CssClassesAssert.isSame(nodeFooterRow.getExpanderPaddingClasses('s', 'custom'), 'controls-TreeGrid__row-expanderPadding controls-TreeGrid__node-footer-expanderPadding_theme-custom controls-TreeGrid__row-expanderPadding_size_s_theme-custom js-controls-ListView__notEditable');
   });

   it('.shouldDisplayVisibleFooter()', () => {
      assert.isFalse(nodeFooterRow.shouldDisplayVisibleFooter(undefined));
      assert.isTrue(nodeFooterRow.shouldDisplayVisibleFooter({}));

      treeGridCollection.setHasMoreStorage({ 3: true });
      assert.isTrue(nodeFooterRow.shouldDisplayVisibleFooter(undefined));
   });
});
