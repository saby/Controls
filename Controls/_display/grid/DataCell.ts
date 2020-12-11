import {mixin} from 'Types/util';
import {Record} from 'Types/entity';
import { Model } from 'Types/entity';
import Cell, {IOptions as ICellOptions} from './Cell';
import DataRow from './DataRow';
import IMarkable from '../interface/IMarkable';
import ITagCell from './interface/ITagCell';
import IItemActionsCell from './interface/IItemActionsCell';
import ILadderContentCell from './interface/ILadderContentCell';
import DataCellCompatibility from './compatibility/DataCell';

export interface IOptions<T> extends ICellOptions<T> {
}

export default class DataCell<T, TOwner extends DataRow<T>> extends mixin<
    Cell<T, TOwner>,
    DataCellCompatibility<T>
>(
    Cell,
    DataCellCompatibility
) implements IMarkable, ITagCell, IItemActionsCell, ILadderContentCell {

    readonly Markable = true;
    readonly TagCell = true;
    readonly ItemActionsCell = true;
    readonly LadderContentCell = true;

    getDefaultDisplayValue(): T {
        const itemModel = this._$owner.getContents();
        if (itemModel instanceof Record) {
            return itemModel.get(this.getDisplayProperty());
        } else {
            return itemModel[this.getDisplayProperty()];
        }
    }

    // region Аспект "Маркер"
    shouldDisplayMarker(marker: boolean, markerPosition: 'left' | 'right' = 'left'): boolean {
        if (markerPosition === 'right') {
            return marker !== false && this._$owner.isMarked() && this.isLastColumn();
        } else {
            return marker !== false && this._$owner.isMarked() &&
                this._$owner.getMultiSelectVisibility() === 'hidden' && this.isFirstColumn();
        }
    }
    // region

    // region Аспект "Объединение ячеек"

    // Объединение ячеек данных должно быть здесь.
    getColspan() {
        // Пока объединение ячеек данных не реализовано, не выводим в html лишние свойства
        return undefined;
    };
    getRowspan() {
        // Пока объединение ячеек данных не реализовано, не выводим в html лишние свойства
        return undefined;
    };
    getColspanStyles() {
        // Пока объединение ячеек данных не реализовано, не выводим в html лишние свойства
        return '';
    };
    getRowspanStyles() {
        // Пока объединение ячеек данных не реализовано, не выводим в html лишние свойства
        return '';
    };
    // endregion

    // region Аспект "Тег"

    /**
     * Возвращает флаг, что надо или не надо показывать тег
     * @param tagStyle
     */
    shouldDisplayTag(tagStyle?: string): boolean {
        return !!this.getTagStyle(tagStyle);
    }

    /**
     * Возвращает tagStyle для текущей колонки
     * @param tagStyle параметр, переданный напрямую в шаблон прикладниками
     */
    getTagStyle(tagStyle?: string): string {
        if (tagStyle) {
            return tagStyle;
        }
        const contents: Model = this._$owner.getContents() as undefined as Model;
        return this._$column.tagStyleProperty &&
            contents.get(this._$column.tagStyleProperty);
    }

    /**
     * Возвращает CSS класс для передачи в шаблон tag
     * @param theme
     */
    getTagClasses(theme: string): string {
        return `controls-Grid__cell_tag_theme-${theme}`;
    }

    // endregion

    // region Аспект "Кнопка редактирования"

    shouldDisplayEditArrow(): boolean {
        if (this.getColumnIndex() > 0) {
            return false;
        }
        return this._$owner.editArrowIsVisible(this._$owner.getContents());
    }

    // endregion
}

Object.assign(DataCell.prototype, {
    '[Controls/_display/grid/DataCell]': true,
    _moduleName: 'Controls/display:GridDataCell',
    _instancePrefix: 'grid-data-cell-'
});
