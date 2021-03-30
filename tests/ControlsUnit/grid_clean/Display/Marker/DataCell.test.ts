import {assert} from 'chai';
import DataCell from 'Controls/_gridNew/display/DataCell';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';

describe('Controls/_gridNew/display/DataCell', () => {
    let shouldDisplayMarker, hasMultiSelectColumn, columnsCount, columnIndex;

    const owner = {
        shouldDisplayMarker: () => shouldDisplayMarker,
        hasMultiSelectColumn: () => hasMultiSelectColumn,
        hasItemActionsSeparatedCell: () => false,
        getColumnsCount: () => columnsCount,
        getColumnIndex: () => columnIndex,
        hasColumnScroll: () => false,
        getHoverBackgroundStyle: () => '',
        getTopPadding: () => 'null',
        getBottomPadding: () => 'null',
        isEditing: () => false,
        isDragged: () => false,
        getEditingBackgroundStyle: () => 'default',
        isActive: () => false,
        getRowSeparatorSize: () => 's',
        getEditingConfig: () => ({})
    };

   describe('shouldDisplayMarker', () => {
       beforeEach(() => {
           shouldDisplayMarker = false;
           hasMultiSelectColumn = false;
           columnsCount = 1;
           columnIndex = 0;
       });

       describe('position is right', () => {
           it('not should display marker', () => {
               shouldDisplayMarker = false;

               const cell = new DataCell({owner});
               assert.isFalse(cell.shouldDisplayMarker(true, 'right'));
           });

           it('should display marker and is last column', () => {
               shouldDisplayMarker = true;

               const cell = new DataCell({owner});
               assert.isTrue(cell.shouldDisplayMarker(true, 'right'));
           });

           it('should display marker and is not last column', () => {
               shouldDisplayMarker = true;
               columnsCount = 2;

               const cell = new DataCell({owner});
               assert.isFalse(cell.shouldDisplayMarker(true, 'right'));
           });
       });

       describe('position is left', () => {
           it('not should display marker', () => {
               shouldDisplayMarker = false;

               const cell = new DataCell({owner});
               assert.isFalse(cell.shouldDisplayMarker(true, 'left'));
           });

           it('should display marker and is first column', () => {
               shouldDisplayMarker = true;

               const cell = new DataCell({owner});
               assert.isTrue(cell.shouldDisplayMarker(true, 'left'));
           });

           it('should display marker and is not first column', () => {
               shouldDisplayMarker = true;
               columnsCount = 2;
               columnIndex = 1;

               const cell = new DataCell({owner});
               assert.isFalse(cell.shouldDisplayMarker(true, 'left'));
           });

           it('should display marker, is first column, has multiselect column', () => {
               shouldDisplayMarker = true;
               columnsCount = 2;
               hasMultiSelectColumn = true;

               const cell = new DataCell({owner});
               assert.isFalse(cell.shouldDisplayMarker(true, 'left'));
           });
       });
   });

    describe('getWrapperClasses', () => {
        beforeEach(() => {
            shouldDisplayMarker = false;
            hasMultiSelectColumn = false;
            columnsCount = 1;
            columnIndex = 0;
        });

        it('not should display marker', () => {
            const cell = new DataCell({owner});
            CssClassesAssert.notInclude(
                cell.getWrapperClasses('default', '', 'master', false),
                'controls-Grid__row-cell_selected controls-Grid__row-cell_selected-master_theme-default ' +
                'controls-Grid__row-cell_selected__first-master_theme-default ' +
                'controls-Grid__row-cell_selected__last controls-Grid__row-cell_selected__last-master_theme-default'
            );
        });

        it('should display marker and is last column', () => {
            shouldDisplayMarker = true;

            const cell = new DataCell({owner});
            CssClassesAssert.include(
                cell.getWrapperClasses('default', '', 'master', false),
                'controls-Grid__row-cell_selected controls-Grid__row-cell_selected-master_theme-default ' +
                'controls-Grid__row-cell_selected__first-master_theme-default ' +
                'controls-Grid__row-cell_selected__last controls-Grid__row-cell_selected__last-master_theme-default'
            );
        });

        it('should display marker and is not last column', () => {
            shouldDisplayMarker = true;
            columnsCount = 2;

            const cell = new DataCell({owner});
            CssClassesAssert.include(
                cell.getWrapperClasses('default', '', 'master', false),
                'controls-Grid__row-cell_selected controls-Grid__row-cell_selected-master_theme-default ' +
                'controls-Grid__row-cell_selected__first-master_theme-default '
            );
        });

        it('should display marker and is not first column', () => {
            shouldDisplayMarker = true;
            columnsCount = 2;
            columnIndex = 1;

            const cell = new DataCell({owner});
            CssClassesAssert.include(
                cell.getWrapperClasses('default', '', 'master', false),
                'controls-Grid__row-cell_selected controls-Grid__row-cell_selected-master_theme-default ' +
                'controls-Grid__row-cell_selected__last controls-Grid__row-cell_selected__last-master_theme-default'
            );
        });
    });
});
