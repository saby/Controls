import { assert } from 'chai';
import { Model } from 'Types/entity';
import { register } from 'Types/di';

import { GridCollection, GridSpaceAfterBodyCell } from 'Controls/display';
import GridSpaceAfterBodyRow, {IOptions} from 'Controls/_display/GridSpaceAfterBodyRow';
import {TColumns} from 'Controls/grid';

// Принудительно регистрируем, т.к. иначе display не вызывается и getColumns() вызвать нельзя
register('Controls/display:GridSpaceAfterBodyCell', GridSpaceAfterBodyCell, {instantiate: false});

describe('Controls/display/GridSpaceAfterBodyRow', () => {
    let owner: GridCollection<Model>;
    let options: IOptions<Model>;
    let needSpaceAfterBody: boolean;
    let multiSelectVisibility: string;
    let columns: TColumns;
    let isFullGridSupport: boolean;

    function initRow(): GridSpaceAfterBodyRow<Model> {
        return new GridSpaceAfterBodyRow(options);
    }

    beforeEach(() => {
        needSpaceAfterBody = true; // it happens if itemActionsPosition === 'outside' and items.count() > 0
        multiSelectVisibility = 'hidden';
        columns = [
            { width: '1fr' },
            { width: '1px' },
            { width: '1px' },
            { width: '1px' }
        ];
        isFullGridSupport = true;
        owner = {
            getMultiSelectVisibility(): string {
                return multiSelectVisibility;
            },
            getColumnsConfig(): TColumns {
                return columns;
            },
            isFullGridSupport(): boolean {
                return isFullGridSupport;
            }
        } as Partial<GridCollection<Model>> as undefined as GridCollection<Model>;
        options = {
            owner,
            columns,
            multiSelectVisibility
        };
    });

    describe('getWrapperClasses', () => {
        it('should have spacing class', () => {
            const classes = initRow().getWrapperClasses(false, 'default');
            assert.include(classes, 'controls-itemActionsV_outside-spacing_theme-default');
        });
    });

    describe('getColumns', () => {
        it('should return colspaned columns', () => {
            const columns = initRow().getColumns();
            assert.lengthOf(columns, 1);
            assert.equal(columns[0].getWrapperStyles(), 'grid-column: 1 / 5;'); // Вся ширина таблицы
        });
    });
});
