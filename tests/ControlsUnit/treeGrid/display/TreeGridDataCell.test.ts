import { RecordSet } from 'Types/collection';
import { TreeGridCollection } from 'Controls/treeGrid';
import { CssClassesAssert } from 'ControlsUnit/CustomAsserts';
import * as Display from 'Controls/display';
import * as sinon from 'sinon';

describe('Controls/_treeGrid/display/TreeGridDataCell', () => {
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
      }]
   });

   describe('getWrapperClasses', () => {
      it('master style', () => {
         const expected = ' controls-Grid__row-cell controls-Grid__cell_default controls-Grid__row-cell_default ' +
             'controls-Grid__row-cell_default_min_height controls-TreeGrid__row-cell ' +
             'controls-TreeGrid__row-cell_default controls-TreeGrid__row-cell__node ' +
             'controls-Grid__no-rowSeparator controls-Grid__row-cell_withRowSeparator_size-null controls-Grid__cell_fit ' +
             'controls-Grid__row-cell-background-hover-default controls-Grid__row-cell_background_master ' +
             'js-controls-ListView__measurableContainer';
         const cell = treeGridCollection.at(0).getColumns()[0];
         CssClassesAssert.isSame(cell.getWrapperClasses('master', 'master'), expected);
      });

      it('without multiselect', () => {
         const expected = ' controls-Grid__row-cell controls-Grid__cell_default controls-Grid__row-cell_default controls-Grid__row-cell_default_min_height controls-TreeGrid__row-cell ' +
            'controls-TreeGrid__row-cell_default controls-TreeGrid__row-cell__node controls-Grid__no-rowSeparator controls-Grid__row-cell_withRowSeparator_size-null controls-Grid__cell_fit ' +
            'controls-Grid__row-cell-background-hover-default ' +
            'js-controls-ListView__measurableContainer';
         const cell = treeGridCollection.at(0).getColumns()[0];
         CssClassesAssert.isSame(cell.getWrapperClasses('default', 'default'), expected);
      });

      it('with multiselect && first column', () => {
         treeGridCollection.setMultiSelectVisibility('visible');
         const expected = ' controls-Grid__row-cell controls-Grid__cell_default controls-Grid__row-cell_default controls-Grid__row-cell-checkbox controls-Grid__row-cell_default_min_height controls-Grid__no-rowSeparator ' +
            'controls-Grid__row-cell_withRowSeparator_size-null js-controls-ListView__notEditable js-controls-DragScroll__notDraggable controls-GridView__checkbox controls-GridView__checkbox_position-default ' +
            'controls-Grid__row-checkboxCell_rowSpacingTop_default controls-Grid__row-cell-background-hover-default controls-Grid__row-cell_rowSpacingBottom_default';
         const cell = treeGridCollection.at(0).getColumns()[0];
         CssClassesAssert.isSame(cell.getWrapperClasses('default', 'default'), expected);
      });

      it('with multiselect && not first column', () => {
         treeGridCollection.setMultiSelectVisibility('visible');

         const expected = ' controls-Grid__row-cell controls-Grid__cell_default controls-Grid__row-cell_default controls-Grid__row-cell_default_min_height controls-TreeGrid__row-cell ' +
            'controls-TreeGrid__row-cell_default controls-TreeGrid__row-cell__node controls-Grid__no-rowSeparator controls-Grid__row-cell_withRowSeparator_size-null controls-Grid__cell_fit ' +
            'controls-Grid__row-cell-background-hover-default ' +
            'js-controls-ListView__measurableContainer';
         const cell = treeGridCollection.at(0).getColumns()[1];
         CssClassesAssert.isSame(cell.getWrapperClasses('default', 'default'), expected);
      });

      it('with multiselect && first column && custom checkbox position', () => {
         treeGridCollection.setMultiSelectPosition('custom');
         treeGridCollection.setMultiSelectVisibility('visible');

         const expected = ' controls-Grid__row-cell controls-Grid__cell_default controls-Grid__row-cell_default controls-Grid__row-cell-checkbox controls-Grid__row-cell_default_min_height controls-Grid__no-rowSeparator ' +
            'controls-Grid__row-cell_withRowSeparator_size-null js-controls-ListView__notEditable js-controls-DragScroll__notDraggable controls-GridView__checkbox controls-GridView__checkbox_position-default ' +
            'controls-Grid__row-checkboxCell_rowSpacingTop_default controls-Grid__row-cell-background-hover-default controls-Grid__row-cell_rowSpacingBottom_default';

         const cell = treeGridCollection.at(0).getColumns()[0];
         CssClassesAssert.isSame(cell.getWrapperClasses('default', 'default'), expected);
      });

      it('not support grid', () => {
         const sandbox = sinon.createSandbox();
         const stubIsFullGridSupport = sandbox.stub(Display, 'isFullGridSupport');
         stubIsFullGridSupport.returns(false);

         const cell = treeGridCollection.at(0).getColumns()[0];
         CssClassesAssert.notInclude(cell.getWrapperClasses('default', 'default'), 'controls-Grid__cell_spacingFirstCol_default');

         sandbox.restore();
      });
   });

   describe('getRelativeCellWrapperClasses', () => {
      it('support grid', () => {
         const expected = 'controls-Grid__table__relative-cell-wrapper controls-Grid__table__relative-cell-wrapper_rowSeparator-null ';
         const cell = treeGridCollection.at(0).getColumns()[1];
         CssClassesAssert.isSame(cell.getRelativeCellWrapperClasses('default'), expected);
      });

      it('not support grid', () => {
         const sandbox = sinon.createSandbox();
         const stubIsFullGridSupport = sandbox.stub(Display, 'isFullGridSupport');
         stubIsFullGridSupport.returns(false);

         const expected = 'controls-TreeGridView__row-cell_innerWrapper controls-Grid__table__relative-cell-wrapper controls-Grid__table__relative-cell-wrapper_rowSeparator-null ';
         const cell = treeGridCollection.at(0).getColumns()[1];
         CssClassesAssert.isSame(cell.getRelativeCellWrapperClasses('default'), expected);

         sandbox.restore();
      });
   });
});
