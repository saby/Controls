import { CssClassesAssert } from 'ControlsUnit/CustomAsserts';
import { RecordSet } from 'Types/collection';
import { TreeGridCollection } from 'Controls/treeGridNew';

describe('Controls/_treeGridNew/display/TreeGridFooterCell', () => {
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
      footer: [{
            width: '300px',
            template: 'wml!template1'
         },
         {
            width: '200px',
            template: 'wml!template1'
         }
      ]
   });

   it ('.getWrapperClasses()', () => {
      const footerCell = treeGridCollection.getFooter().getColumns()[0];
      CssClassesAssert.isSame(footerCell.getWrapperClasses('default'), 'controls-GridView__footer-cell controls-GridView__footer__cell_theme-default controls-background-undefined_theme-default controls-GridView__footer__cell__paddingLeft_default_theme-default controls-TreeGridView__footer__expanderPadding-default_theme-default');
   });
});
