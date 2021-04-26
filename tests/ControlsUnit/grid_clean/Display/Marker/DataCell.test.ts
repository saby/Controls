import {assert} from 'chai';
import DataCell from 'Controls/_grid/display/DataCell';
import {CssClassesAssert} from 'ControlsUnit/CustomAsserts';
import {RecordSet} from 'Types/collection';
import {GridCollection} from 'Controls/grid';

describe('Controls/_grid/display/DataCell', () => {
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

               const cell = new DataCell({owner, markerPosition: 'right'});
               assert.isFalse(cell.shouldDisplayMarker(true));
           });

           it('should display marker and is last column', () => {
               shouldDisplayMarker = true;

               const cell = new DataCell({owner, markerPosition: 'right'});
               assert.isTrue(cell.shouldDisplayMarker(true));
           });

           it('should display marker and is not last column', () => {
               shouldDisplayMarker = true;
               columnsCount = 2;

               const cell = new DataCell({owner, markerPosition: 'right'});
               assert.isFalse(cell.shouldDisplayMarker(true));
           });
       });

       describe('position is left', () => {
           it('not should display marker', () => {
               shouldDisplayMarker = false;

               const cell = new DataCell({owner, markerPosition: 'left'});
               assert.isFalse(cell.shouldDisplayMarker(true));
           });

           it('should display marker and is first column', () => {
               shouldDisplayMarker = true;

               const cell = new DataCell({owner, markerPosition: 'left', isFirstDataCell: true});
               assert.isTrue(cell.shouldDisplayMarker(true));
           });

           it('should display marker and is not first column', () => {
               shouldDisplayMarker = true;
               columnsCount = 2;
               columnIndex = 1;

               const cell = new DataCell({owner, markerPosition: 'left'});
               assert.isFalse(cell.shouldDisplayMarker(true));
           });

           it('should display marker, is first column, has multiselect column', () => {
               shouldDisplayMarker = true;
               columnsCount = 2;
               hasMultiSelectColumn = true;

               const cell = new DataCell({owner, markerPosition: 'left'});
               assert.isFalse(cell.shouldDisplayMarker(true));
           });

           it('has StickyLadderCell in start', () => {
               const recordSet = new RecordSet({ rawData: [{id: 1, aaa: 1}, {id: 2, aaa: 1}], keyProperty: 'id' });
               const collection = new GridCollection({
                   keyProperty: 'id',
                   collection: recordSet,
                   backgroundStyle: 'custom',
                   ladderProperties: ['aaa'],
                   columns: [{width: '1px', stickyProperty: 'aaa'}, {width: '1px'}]
               });
               collection.setMarkedKey(1, true);

               const item = collection.getItemBySourceKey(1);
               assert.isFalse(item.getColumns()[0].shouldDisplayMarker());
               assert.isTrue(item.getColumns()[1].shouldDisplayMarker());
               assert.isFalse(item.getColumns()[2].shouldDisplayMarker());
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
                'controls-Grid__row-cell_selected controls-Grid__row-cell_selected-master ' +
                'controls-Grid__row-cell_selected__first-master ' +
                'controls-Grid__row-cell_selected__last controls-Grid__row-cell_selected__last-master'
            );
        });

        it('should display marker and is last column', () => {
            shouldDisplayMarker = true;

            const cell = new DataCell({owner});
            CssClassesAssert.include(
                cell.getWrapperClasses('default', '', 'master', false),
                'controls-Grid__row-cell_selected controls-Grid__row-cell_selected-master ' +
                'controls-Grid__row-cell_selected__first-master ' +
                'controls-Grid__row-cell_selected__last controls-Grid__row-cell_selected__last-master'
            );
        });

        it('should display marker and is not last column', () => {
            shouldDisplayMarker = true;
            columnsCount = 2;

            const cell = new DataCell({owner});
            CssClassesAssert.include(
                cell.getWrapperClasses('default', '', 'master', false),
                'controls-Grid__row-cell_selected controls-Grid__row-cell_selected-master ' +
                'controls-Grid__row-cell_selected__first-master '
            );
        });

        it('should display marker and is not first column', () => {
            shouldDisplayMarker = true;
            columnsCount = 2;
            columnIndex = 1;

            const cell = new DataCell({owner});
            CssClassesAssert.include(
                cell.getWrapperClasses('default', '', 'master', false),
                'controls-Grid__row-cell_selected controls-Grid__row-cell_selected-master ' +
                'controls-Grid__row-cell_selected__last controls-Grid__row-cell_selected__last-master'
            );
        });
    });
});
