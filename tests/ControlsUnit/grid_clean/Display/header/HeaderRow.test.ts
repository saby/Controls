import { createSandbox } from 'sinon';
import { Model } from 'Types/entity';
import { GridHeader, GridHeaderRow, IGridHeaderRowOptions, GridCollection, GridCell, GridRow } from 'Controls/grid';

import {assert} from "chai";

describe('Controls/grid_clean/Display/header/HeaderRow', () => {
    const columns = [{ width: '1px' }];
    const owner = {
        getStickyColumnsCount: () => 1,
        getGridColumnsConfig: () => columns,
        hasMultiSelectColumn: () => false,
        hasItemActionsSeparatedCell: () => false
    } as undefined as GridCollection<Model>;

    const headerModel = {
        isMultiline: () => false
    } as undefined as GridHeader<Model>;

    describe('_initializeColumns', () => {
        it('should call columnFactory with correct params', () => {

            const sandBox = createSandbox();

            function MockedFactory(): (options: any) => GridCell<any, any> {
                return (options) => {
                    const standardOptions = {
                        column: {},
                        isFixed: true,
                        sorting: undefined,
                        cellPadding: undefined,
                        backgroundStyle: 'custom',
                        columnSeparatorSize: null,
                        shadowVisibility: 'lastVisible'
                    };

                    // assertion here
                    assert.deepEqual(options, standardOptions);

                    return {} as undefined as GridCell<any, GridRow<any>>;
                };
            }

            const row = new GridHeaderRow({
                header: [ { } ],
                columns,
                headerModel,
                owner,
                backgroundStyle: 'custom',
                style: 'default'
            } as undefined as IGridHeaderRowOptions<any>);

            sandBox.replace(row, 'getColumnsFactory', MockedFactory);

            row.getColumns();

            // assertion inside MockedFactory above

            sandBox.restore();
        });
    });
});
