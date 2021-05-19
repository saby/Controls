import {assert} from 'chai';
import {getHeaderMaxEndCellData, getHeaderRowsArray} from 'Controls/_gridOld/utils/GridRowIndexUtil';
import {IHeaderCell} from 'Controls/grid';

interface ICustomHeaderCell extends IHeaderCell {
    title?: string;
    style?: string;
}

describe('Controls/_gridOld/utils/GridRowIndexUtil', () => {
    describe('getHeaderMaxEndCellData', () => {
        let gridHeaderWithStartEndParams: ICustomHeaderCell[];
        let gridHeaderWithoutStartEndParams: ICustomHeaderCell[];
        let gridMultiHeaderWithStartEndParams: ICustomHeaderCell[];
        let gridHeaderWithColspanStartEndParams: ICustomHeaderCell[];

        beforeEach(() => {
            gridHeaderWithStartEndParams = [
                {
                    title: '',
                    style: 'default',
                    startRow: 1,
                    endRow: 2,
                    startColumn: 1,
                    endColumn: 2
                },
                {
                    title: 'Цена',
                    align: 'right',
                    style: 'default',
                    sortingProperty: 'price',
                    startRow: 1,
                    endRow: 2,
                    startColumn: 2,
                    endColumn: 3
                },
                {
                    title: 'Остаток',
                    align: 'right',
                    style: 'default',
                    startRow: 1,
                    endRow: 2,
                    startColumn: 3,
                    endColumn: 4
                }
            ];
            gridHeaderWithColspanStartEndParams = [
                {
                    title: '',
                    style: 'default',
                    startRow: 1,
                    endRow: 3,
                    startColumn: 1,
                    endColumn: 2
                },
                {
                    title: 'Цена',
                    align: 'right',
                    style: 'default',
                    sortingProperty: 'price',
                    startRow: 1,
                    endRow: 3,
                    startColumn: 2,
                    endColumn: 4
                }
            ];
            gridMultiHeaderWithStartEndParams = [
                {
                    title: '',
                    style: 'default',
                    startRow: 1,
                    endRow: 3,
                    startColumn: 1,
                    endColumn: 2
                },
                {
                    title: 'Цена',
                    align: 'right',
                    style: 'default',
                    sortingProperty: 'price',
                    startRow: 1,
                    endRow: 2,
                    startColumn: 2,
                    endColumn: 4
                },
                {
                    title: 'Остаток',
                    align: 'right',
                    style: 'default',
                    startRow: 2,
                    endRow: 3,
                    startColumn: 2,
                    endColumn: 4
                }
            ];
            gridHeaderWithoutStartEndParams = [
                {
                    title: '',
                    style: 'default'
                },
                {
                    title: 'Цена',
                    align: 'right',
                    style: 'default',
                    sortingProperty: 'price'
                },
                {
                    title: 'Остаток',
                    align: 'right',
                    style: 'default'
                }
            ];
        });

        it('should calculate endColumn for actionCell when startRow and endRow are set for columns with multiselect', () => {
            const headerRows = getHeaderRowsArray(gridHeaderWithStartEndParams, true, false, true);
            const lastColumnData = getHeaderMaxEndCellData(headerRows);
            // In fact it should be 6, not 5, but this delta is calculating in ScrollWrapper
            assert.equal(lastColumnData.maxColumn, 5);
        });

        it('should calculate endColumn for actionCell when startRow and endRow are set for columns w/o multiselect', () => {
            const headerRows = getHeaderRowsArray(gridHeaderWithoutStartEndParams, false, false, true);
            const lastColumnData = getHeaderMaxEndCellData(headerRows);
            // In fact it should be 6 because of hasMultiSelect, not 5, but this delta is calculating in ScrollWrapper
            assert.equal(lastColumnData.maxColumn, 5);
        });

        it('should calculate endColumn for actionCell with multiselect and multiheader', () => {
            const headerRows = getHeaderRowsArray(gridMultiHeaderWithStartEndParams, true, true, true);
            const lastColumnData = getHeaderMaxEndCellData(headerRows);
            // In fact it should be 6, not 5, but this delta is calculating in ScrollWrapper
            assert.equal(lastColumnData.maxColumn, 5);
        });

        it('should calculate endColumn for actionCell w/o multiselect and with multiheader', () => {
            const headerRows = getHeaderRowsArray(gridMultiHeaderWithStartEndParams, false, true, true);
            const lastColumnData = getHeaderMaxEndCellData(headerRows);
            // In fact it should be 6, not 5, but this delta is calculating in ScrollWrapper
            assert.equal(lastColumnData.maxColumn, 5);
        });

        it('should calculate endColumn for actionCell w/o multiHeader but with "colspan" and/or "rowspan"', () => {
            const headerRows = getHeaderRowsArray(gridHeaderWithColspanStartEndParams, false, false, true);
            const lastColumnData = getHeaderMaxEndCellData(headerRows);
            // In fact it should be 6, not 5, but this delta is calculating in ScrollWrapper
            assert.equal(lastColumnData.maxColumn, 5);
        });
    });
});
