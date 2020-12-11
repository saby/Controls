import { assert } from 'chai';
import { Model } from 'Types/entity';

import { GridDataCell, GridDataRow } from 'Controls/display';
import {IColumn} from 'Controls/grid';

describe('Controls/display/GridDataCell', () => {
    let owner: GridDataRow<Model>;
    let cell: GridDataCell<Model, GridDataRow<Model>>;
    let multiSelectVisibility: string;
    let columnIndex: number;
    let columnsCount: number;
    let column: IColumn;
    let editArrowIsVisible: boolean;

    function initCell(): GridDataCell<Model, GridDataRow<Model>> {
        cell = new GridDataCell<Model, GridDataRow<Model>>({
            owner,
            column
        });
        return cell;
    }

    beforeEach(() => {
        column = {
            width: '1px'
        };
        multiSelectVisibility = 'hidden';
        columnIndex = 0;
        columnsCount = 4;
        editArrowIsVisible = false;
        owner = {
            getColumnIndex(): number {
                return columnIndex;
            },
            editArrowIsVisible(): boolean {
                return editArrowIsVisible;
            },
            getContents(): Model {
                return {} as undefined as Model;
            }
        } as Partial<GridDataRow<Model>> as undefined as GridDataRow<Model>;
    });

    // region Аспект "Кнопка редактирования"

    describe('editArrow', () => {
        it('shouldDisplayEditArrow should return true for first column', () => {
            editArrowIsVisible = true;
            assert.isTrue(initCell().shouldDisplayEditArrow());
        });
        it('shouldDisplayEditArrow should not return true for non-first column', () => {
            editArrowIsVisible = true;
            columnIndex = 3;
            assert.isFalse(initCell().shouldDisplayEditArrow());
        });
    });

    // endregion
});
