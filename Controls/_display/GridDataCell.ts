import { Model } from 'Types/entity';
import GridCell, {IOptions as IGridCellOptions} from './GridCell';
import GridDataRow from './GridDataRow';

export interface IOptions<T> extends IGridCellOptions<T> {
}

/**
 * @typedef {Function} TEditArrowVisibilityCallback
 * @description
 * Функция обратного вызова для определения видимости кнопки редактирования в свайпе.
 * @param item Model
 */
export type TEditArrowVisibilityCallback = (item: Model) => boolean;

export default class GridDataCell<T, TOwner extends GridDataRow<T>> extends GridCell<T, TOwner> {

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
        let contents: Model = this._$owner.getContents() as undefined as Model;
        if (this._$editArrowVisibilityCallback === undefined) {
            return this._$showEditArrow;
        }
        if (this._$owner['[Controls/_display/BreadcrumbsItem]']) {
            contents = contents[(contents as any).length - 1];
        }
        return this.getColumnIndex() === 0 && this._$showEditArrow && this._$editArrowVisibilityCallback(contents);
    }

    // endregion
}

Object.assign(GridDataCell.prototype, {
    '[Controls/_display/GridDataCell]': true,
    _moduleName: 'Controls/display:GridDataCell',
    _instancePrefix: 'grid-data-cell-'
});
