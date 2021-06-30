import { CssClassesAssert } from 'ControlsUnit/CustomAsserts';
import { RecordSet } from 'Types/collection';
import { TreeGridCollection } from 'Controls/treeGrid';

const DATA_SET = new RecordSet({
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

describe('Controls/_treeGrid/display/TreeGridFooterCell', () => {
   // it ('.getWrapperClasses()', () => {
   //     const treeGridCollection = new TreeGridCollection({
   //         collection: DATA_SET,
   //         root: null,
   //         keyProperty: 'id',
   //         parentProperty: 'parent',
   //         nodeProperty: 'node',
   //         hasChildrenProperty: 'hasChildren',
   //         columns: [{
   //             displayProperty: 'title',
   //             width: '300px',
   //             template: 'wml!template1'
   //         },
   //             {
   //                 displayProperty: 'taxBase',
   //                 width: '200px',
   //                 template: 'wml!template1'
   //             }
   //         ],
   //         footer: [{
   //             width: '300px',
   //             template: 'wml!template1'
   //         },
   //             {
   //                 width: '200px',
   //                 template: 'wml!template1'
   //             }
   //         ]
   //     });
   //
   //    const footerCell = treeGridCollection.getFooter().getColumns()[0];
   //    CssClassesAssert.isSame(footerCell.getWrapperClasses('default'), 'controls-ListView__footer controls-Grid__cell_spacingFirstCol_default controls-Grid__cell_spacingRight controls-GridView__footer__cell controls-TreeGridView__expanderPadding-default controls-background-default');
   // });
});
