import { TemplateFunction } from 'UI/Base';
import { IMarkable } from 'Controls/display';
import Cell from './Cell';
import DataRow from './DataRow';
import {DRAG_SCROLL_JS_SELECTORS} from 'Controls/columnScroll';

export default class CheckboxCell<T, TOwner extends DataRow<T>> extends Cell<T, TOwner> implements IMarkable {
    readonly Markable: boolean = true;

    isEditing(): boolean {
        return this._$owner.isEditing();
    }

    getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover?: boolean, templateHoverBackgroundStyle?: string): string {
        const hoverBackgroundStyle = templateHoverBackgroundStyle || this._$owner.getHoverBackgroundStyle();

        let wrapperClasses = '';

        wrapperClasses += this._getWrapperBaseClasses(theme, style, templateHighlightOnHover);
        wrapperClasses += this._getWrapperSeparatorClasses(theme);
        wrapperClasses += ' js-controls-ListView__notEditable' +
            ` ${DRAG_SCROLL_JS_SELECTORS.NOT_DRAG_SCROLLABLE}` +
            ' controls-GridView__checkbox' +
            ' controls-GridView__checkbox_position-default' +
            ' controls-Grid__row-cell-checkbox';

        if (this.isEditing()) {
            wrapperClasses += ' controls-Grid__row-cell-editing';
        }

        if (this._$owner.isFullGridSupport()) {
            wrapperClasses += this._getCheckboxCellPaddingClasses();
        }

        wrapperClasses += ` ${this._getBackgroundColorWrapperClasses(theme, style, backgroundColorStyle, templateHighlightOnHover, hoverBackgroundStyle)}`;

        if (this._$owner.hasColumnScroll()) {
            wrapperClasses += ` ${this._getColumnScrollWrapperClasses(theme)}`;
        }

        return wrapperClasses;
    }

    getContentClasses(
       theme: string,
       backgroundColorStyle: string,
       cursor: string = 'pointer',
       templateHighlightOnHover: boolean = true
    ): string {
        // Навешиваем классы в Row::getMultiSelectClasses, т.к. если позиция custom, то мы не создадим CheckboxCell
        return '';
    }

    getTemplate(): TemplateFunction|string {
        return this.getOwner().getMultiSelectTemplate();
    }

    shouldDisplayMarker(marker: boolean): boolean {
        return this.getMarkerPosition() !== 'right' && this._$owner.shouldDisplayMarker(marker);
    }

    shouldDisplayItemActions(): boolean {
        return false;
    }

    // Only for partial grid support
    getRelativeCellWrapperClasses(): string {
        return super.getRelativeCellWrapperClasses() + this._getCheckboxCellPaddingClasses();
    }

    private _getCheckboxCellPaddingClasses(): string {
        const topPadding = this.getOwner().getTopPadding();
        const bottomPadding = this.getOwner().getBottomPadding();
        const paddingClasses =
            ` controls-Grid__row-checkboxCell_rowSpacingTop_${topPadding}` +
            ` controls-Grid__row-cell_rowSpacingBottom_${bottomPadding} `;
        return paddingClasses;
    }
}

Object.assign(CheckboxCell.prototype, {
    '[Controls/_display/grid/CheckboxCell]': true,
    _moduleName: 'Controls/display:GridCheckboxCell',
    _instancePrefix: 'grid-checkbox-cell-',
    _$style: null
});
