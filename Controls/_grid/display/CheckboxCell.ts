import { TemplateFunction } from 'UI/Base';
import { IMarkable } from 'Controls/display';
import Cell from './Cell';
import DataRow from './DataRow';

export default class CheckboxCell<T, TOwner extends DataRow<T>> extends Cell<T, TOwner> implements IMarkable {
    readonly Markable: boolean = true;

    getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover: boolean): string {
        const hoverBackgroundStyle = this._$owner.getHoverBackgroundStyle();
        const topPadding = this._$owner.getTopPadding();

        let wrapperClasses = '';

        wrapperClasses += this._getWrapperBaseClasses(theme, style, templateHighlightOnHover);
        wrapperClasses += this._getWrapperSeparatorClasses(theme);
        wrapperClasses += ' js-controls-ListView__notEditable' +
            ' js-controls-ColumnScroll__notDraggable' +
            ' controls-GridView__checkbox' +
            ' controls-GridView__checkbox_position-default' +
            ` controls-Grid__row-checkboxCell_rowSpacingTop_${topPadding}` +
            ` controls-Grid__row-cell_rowSpacingBottom_${this.getOwner().getBottomPadding()} ` +
            ' controls-Grid__row-cell-checkbox' +
            ` controls-background-${backgroundColorStyle || style}`;

        if (this._$owner.isEditing()) {
            wrapperClasses += ' controls-Grid__row-cell-editing';
        }

        wrapperClasses += ` ${this._getBackgroundColorWrapperClasses(theme, style, templateHighlightOnHover, backgroundColorStyle, hoverBackgroundStyle)}`;

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

    getTemplate(multiSelectTemplate: TemplateFunction): TemplateFunction|string {
        return multiSelectTemplate;
    }

    shouldDisplayMarker(marker: boolean): boolean {
        return this.getMarkerPosition() !== 'right' && this._$owner.shouldDisplayMarker(marker);
    }

    shouldDisplayItemActions(): boolean {
        return false;
    }
}

Object.assign(CheckboxCell.prototype, {
    '[Controls/_display/grid/CheckboxCell]': true,
    _moduleName: 'Controls/display:GridCheckboxCell',
    _instancePrefix: 'grid-checkbox-cell-',
    _$style: null
});
