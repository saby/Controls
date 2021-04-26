import {mixin} from 'Types/util';
import {Record, Model} from 'Types/entity';

import {IMarkable, ILadderConfig, TLadderElement} from 'Controls/display';

import { IDisplaySearchValue, IDisplaySearchValueOptions } from './interface/IDisplaySearchValue';

import ITagCell from './interface/ITagCell';
import ILadderContentCell from './interface/ILadderContentCell';
import IItemActionsCell from './interface/IItemActionsCell';
import Cell, {IOptions as ICellOptions} from './Cell';
import DataRow from './DataRow';
import DataCellCompatibility from './compatibility/DataCell';
import {TemplateFunction} from 'UI/Base';

export interface IOptions<T> extends ICellOptions<T>, IDisplaySearchValueOptions {
    backgroundStyle: string;
    markerPosition: string;
}

export default class DataCell<T extends Model, TOwner extends DataRow<T>> extends mixin<
    Cell<T, TOwner>,
    DataCellCompatibility<T>
>(
    Cell,
    DataCellCompatibility
) implements IMarkable, ITagCell, IItemActionsCell, ILadderContentCell, IDisplaySearchValue {

    readonly DisplaySearchValue: boolean = true;
    readonly Markable: boolean = true;
    readonly Draggable: boolean = true;
    readonly TagCell: boolean = true;
    readonly ItemActionsCell: boolean = true;
    readonly LadderContentCell: boolean = true;

    protected _$backgroundStyle: string;

    protected _$searchValue: string;

    private _$isFirstDataCell: boolean;

    get ladder(): TLadderElement<ILadderConfig> {
        return this.getOwner().getLadder();
    }

    setSearchValue(searchValue: string): void {
        this._$searchValue = searchValue;
        this._nextVersion();
    }

    getContentClasses(theme: string,
                      backgroundColorStyle: string = this._$column.backgroundColorStyle,
                      cursor: string = 'pointer',
                      templateHighlightOnHover: boolean = true,
                      tmplIsEditable: boolean = true): string {
        let classes = super.getContentClasses(theme, backgroundColorStyle, cursor, templateHighlightOnHover);

        if (this._$isHiddenForLadder) {
            classes += ` controls-background-${this._$backgroundStyle}`;
        }

        if (this._$owner.isAnimatedForSelection()) {
            classes += ' controls-ListView__item_rightSwipeAnimation';
        }

        if (this._$owner.getEditingConfig()?.mode === 'cell') {
            classes += ' controls-Grid__row-cell_editing-mode-single-cell';

            if (this.isEditing()) {
                classes += ' controls-Grid__row-cell_single-cell_editing';
            } else {
                if (this.config.editable !== false && tmplIsEditable !== false) {
                    classes += ' controls-Grid__row-cell_single-cell_editable';
                } else {
                    classes += ' js-controls-ListView__notEditable controls-Grid__row-cell_single-cell_not-editable';
                }
            }
        }

        return classes;
    }

    getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover: boolean): string {
        let classes = super.getWrapperClasses(theme, backgroundColorStyle, style, templateHighlightOnHover);

        // нужен shouldDisplayMarker именно для всего элемента, т.к. эти стили навешиваются на все ячейки для текста
        if (this.getOwner().shouldDisplayMarker()) {
            classes += ` controls-Grid__row-cell_selected controls-Grid__row-cell_selected-${style}`;

            if (this.isFirstColumn()) {
                classes += ` controls-Grid__row-cell_selected__first-${style}`;
            }
            if (this.isLastColumn()) {
                classes += ` controls-Grid__row-cell_selected__last controls-Grid__row-cell_selected__last-${style}`;
            }
        }

        return classes;
    }

    // region Аспект "Рендер"
    getDefaultDisplayValue(): string | number {
        const itemModel = this._$owner.getContents();
        if (itemModel instanceof Record) {
            return itemModel.get(this.getDisplayProperty());
        } else {
            return itemModel[this.getDisplayProperty()];
        }
    }

    getTooltip(): string {
        const itemModel = this._$owner.getContents();

        if (itemModel instanceof Record) {
            return itemModel.get(this.getTooltipProperty());
        } else {
            return itemModel[this.getTooltipProperty()];
        }
    }
    // endregion

    // region Аспект "Маркер"
    shouldDisplayMarker(marker?: boolean): boolean {
        if (this.getMarkerPosition() === 'right') {
            return this._$owner.shouldDisplayMarker(marker) && this.isLastColumn();
        } else {
            return this._$owner.shouldDisplayMarker(marker) &&
                !this._$owner.hasMultiSelectColumn() && this._$isFirstDataCell;
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
        return `controls-Grid__cell_tag`;
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

    shouldDisplayEditArrow(contentTemplate?: TemplateFunction): boolean {
        if (!!contentTemplate || this.getColumnIndex() > 0) {
            return false;
        }
        return this._$owner.editArrowIsVisible(this._$owner.getContents());
    }

    // endregion

    // region Аспект "Обрезка текста по многоточию"

    getTextOverflowClasses(): string {
        let classes =  `controls-Grid__cell_${this.config.textOverflow || 'none'} `;

        // Для правильного отображения стрелки редактирования рядом с текстом, который
        // обрезается нужно повесить на контейнер с этим текстом специальные CSS классы
        if (this.config.textOverflow && this.shouldDisplayEditArrow(null)) {
            classes += `controls-Grid__editArrow-cellContent controls-Grid__editArrow-overflow-${this.config.textOverflow}`;
        }
        return classes;
    }

    getTextOverflowTitle(): string | number {
        return this.config.textOverflow &&
               !this.config.template &&
               !this.config.tooltipProperty ? this.getDefaultDisplayValue() : '';
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
    _moduleName: 'Controls/grid:GridDataCell',
    _$backgroundStyle: 'default',
    _$searchValue: '',
    _$isFirstDataCell: false,
    _instancePrefix: 'grid-data-cell-'
});
