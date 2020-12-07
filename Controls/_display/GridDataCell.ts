import { Model } from 'Types/entity';
import GridCell, {IOptions as IGridCellOptions} from './GridCell';
import GridDataRow from './GridDataRow';
import IMarkable from './interface/IMarkable';
import ITagCell from './grid/interface/ITagCell';
import IItemActionsCell from './grid/interface/IItemActionsCell';
import ILadderContentCell from './grid/interface/ILadderContentCell';

export interface IOptions<T> extends IGridCellOptions<T> {
}

export default class GridDataCell<T, TOwner extends GridDataRow<T>> extends GridCell<T, TOwner> implements IMarkable, ITagCell, IItemActionsCell, ILadderContentCell {
    readonly Markable = true;
    readonly TagCell = true;
    readonly ItemActionsCell = true;
    readonly LadderContentCell = true;

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
}

Object.assign(GridDataCell.prototype, {
    '[Controls/_display/GridDataCell]': true,
    _moduleName: 'Controls/display:GridDataCell',
    _instancePrefix: 'grid-data-cell-'
});
