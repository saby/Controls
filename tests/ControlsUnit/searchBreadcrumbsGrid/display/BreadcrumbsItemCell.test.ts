import { SearchGridCollection} from 'Controls/searchBreadcrumbsGrid';
import { assert } from 'chai';
import getRecordSet from 'ControlsUnit/searchBreadcrumbsGrid/display/getRecordSet';
import { CssClassesAssert } from 'ControlsUnit/CustomAsserts';

describe('Controls/_searchBreadcrumbsGrid/display/BreadcrumbsItemCell', () => {
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

   describe('getTemplate', () => {
      it('getTemplate', () => {
         const cell = searchGridCollection.at(0).getColumns()[0];
         assert.equal(cell.getTemplate(), 'Controls/searchBreadcrumbsGrid:SearchBreadcrumbsItemTemplate');
      });
   });

   describe('getWrapperClasses', () => {
      it('getWrapperClasses', () => {
         const cell = searchGridCollection.at(0).getColumns()[0];
         assert.isTrue(cell.getWrapperClasses().includes('controls-TreeGrid__row__searchBreadCrumbs js-controls-ListView__notEditable'));
      });
   });

   describe('getContentClasses', () => {
      it('getContentClasses', () => {
         const expected = 'controls-Grid__row-cell__content_colspaned controls-Grid__cell_spacingLastCol_default_theme-default' +
            ' controls-Grid__row-cell_rowSpacingTop_default_theme-default controls-Grid__row-cell_rowSpacingBottom_default_theme-default' +
            ' controls-Grid__cell_spacingFirstCol_default_theme-default';
         const cell = searchGridCollection.at(0).getColumns()[0];
         CssClassesAssert.isSame(cell.getContentClasses('default', 'default'), expected);
      });
   });
});
