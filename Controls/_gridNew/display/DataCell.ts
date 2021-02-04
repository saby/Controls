import {mixin} from 'Types/util';
import {Record, Model} from 'Types/entity';

import {IMarkable, ILadderConfig, TLadderElement} from 'Controls/display';

import ITagCell from './interface/ITagCell';
import ILadderContentCell from './interface/ILadderContentCell';
import IItemActionsCell from './interface/IItemActionsCell';
import Cell, {IOptions as ICellOptions} from './Cell';
import DataRow from './DataRow';
import DataCellCompatibility from './compatibility/DataCell';

export interface IOptions<T> extends ICellOptions<T> {
}

export default class DataCell<T extends Model, TOwner extends DataRow<T>> extends mixin<
    Cell<T, TOwner>,
    DataCellCompatibility<T>
>(
    Cell,
    DataCellCompatibility
) implements IMarkable, ITagCell, IItemActionsCell, ILadderContentCell {

    readonly Markable: boolean = true;
    readonly Draggable: boolean = true;
    readonly TagCell: boolean = true;
    readonly ItemActionsCell: boolean = true;
    readonly LadderContentCell: boolean = true;

    get ladder(): TLadderElement<ILadderConfig> {
        return this.getOwner().getLadder();
    }

    getContentClasses(theme: string,
                      backgroundColorStyle: string = this._$column.backgroundColorStyle,
                      cursor: string = 'pointer',
                      templateHighlightOnHover: boolean = true,
                      tmplIsEditable: boolean = true): string {
        let classes = super.getContentClasses(theme, backgroundColorStyle, cursor, templateHighlightOnHover);

        if (this._$owner.getEditingConfig()?.mode === 'cell') {
            classes += ` controls-Grid__row-cell_editing-mode-single-cell_theme-${theme}`;

            if (this.isEditing()) {
                classes += ` controls-Grid__row-cell_single-cell_editing_theme-${theme}`;
            } else {
                if (this.getColumnConfig().editable !== false && tmplIsEditable !== false) {
                    classes += ` controls-Grid__row-cell_single-cell_editable_theme-${theme}`;
                } else {
                    classes += ` js-controls-ListView__notEditable controls-Grid__row-cell_single-cell_not-editable_theme-${theme}`;
                }
            }
        }

        return classes;
    }

    // region Аспект "Рендер"
    getDefaultDisplayValue(): T {
        const itemModel = this._$owner.getContents();
        if (itemModel instanceof Record) {
            return itemModel.get(this.getDisplayProperty());
        } else {
            return itemModel[this.getDisplayProperty()];
        }
    }
    // endregion

    // region Аспект "Маркер"
    shouldDisplayMarker(marker: boolean, markerPosition: 'left' | 'right' = 'left'): boolean {
        if (markerPosition === 'right') {
            return this._$owner.shouldDisplayMarker(marker) && this.isLastColumn();
        } else {
            return this._$owner.shouldDisplayMarker(marker) &&
                this._$owner.getMultiSelectVisibility() === 'hidden' && this.isFirstColumn();
        }
    }
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

    // region Аспект "Редактирование по месту"

    isEditing(): boolean {
        if (this.getOwner().getEditingConfig()?.mode === 'cell') {
            return this.getOwner().isEditing() && this.getOwner().getEditingColumnIndex() === this.getOwner().getColumnIndex(this);
        } else {
            return this.getOwner().isEditing();
        }
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

    // region Drag-n-drop

    shouldDisplayDraggingCounter(): boolean {
        return this.isLastColumn() && this.getOwner().shouldDisplayDraggingCounter();
    }

    // endregion Drag-n-drop
}

Object.assign(DataCell.prototype, {
    '[Controls/_display/grid/DataCell]': true,
    _moduleName: 'Controls/gridNew:GridDataCell',
    _instancePrefix: 'grid-data-cell-'
});
