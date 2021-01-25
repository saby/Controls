import Row from './Row';
import Cell, {IOptions as ICellOptions} from './Cell';
import IItemActionsCell from './interface/IItemActionsCell';

export interface IOptions<T> extends ICellOptions<T> {
}

const DEFAULT_CELL_CONTENT = 'Controls/gridNew:ItemActionsCellContent';

export default class ItemActionsCell<T> extends Cell<T, Row<T>> implements IItemActionsCell {
    readonly ItemActionsCell = true;

    getTemplate() {
        return DEFAULT_CELL_CONTENT;
    }

    getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover: boolean): string {
        if (!this._$owner['[Controls/_display/grid/DataRow]']) {
            return '';
        }
        if (this._$owner.isFullGridSupport()) {
            return 'controls-itemActionsV__container controls-Grid__itemAction js-controls-ColumnScroll__notDraggable';
        } else {
            return `${super.getWrapperClasses(theme, backgroundColorStyle, style, templateHighlightOnHover)} controls-Grid-table-layout__itemActions__container`;
        }
    }

    getWrapperStyles() {
        return 'width: 0px; min-width: 0px; max-width: 0px; padding: 0px;';
    }


    shouldDisplayItemActions(): boolean {
        return !!this._$owner['[Controls/_display/grid/DataRow]'];
    }
}

Object.assign(ItemActionsCell.prototype, {
    '[Controls/_display/grid/ItemActionsCell]': true,
    _moduleName: 'Controls/display:ItemActionsCell',
    _instancePrefix: 'grid-item-actions-cell-'
});
