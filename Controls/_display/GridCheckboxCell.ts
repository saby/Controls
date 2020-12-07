import GridCell from './GridCell';
import { TemplateFunction } from 'UI/Base';
import GridRow from './GridDataRow';
import IMarkable from './interface/IMarkable';

export default class GridCheckboxCell<T, TOwner extends GridRow<T>> extends GridCell<T, TOwner> implements IMarkable {
    readonly Markable: boolean = true;

    getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover: boolean): string {
        const hoverBackgroundStyle = this._$owner.getHoverBackgroundStyle() || 'default';
        const topPadding = this._$owner.getTopPadding();

        let wrapperClasses = '';

        wrapperClasses += this._getWrapperBaseClasses(theme, style, templateHighlightOnHover);
        wrapperClasses += this._getWrapperSeparatorClasses(theme);
        wrapperClasses += ' js-controls-ListView__notEditable' +
            ' js-controls-ColumnScroll__notDraggable' +
            ` controls-GridView__checkbox_theme-${theme}` +
            ` controls-GridView__checkbox_position-default_theme-${theme}` +
            ` controls-Grid__row-checkboxCell_rowSpacingTop_${topPadding}_theme-${theme}`;

        if (this._$owner.isEditing()) {
            const editingBackgroundStyle = this._$owner.getEditingBackgroundStyle();
            wrapperClasses += ` controls-Grid__row-cell-editing_theme-${theme}`;
            wrapperClasses += ` controls-Grid__row-cell-background-editing_${editingBackgroundStyle}_theme-${theme}`;
        } else if (templateHighlightOnHover !== false) {
            wrapperClasses += ` controls-Grid__row-cell-background-hover-${hoverBackgroundStyle}_theme-${theme}`;
        }
        return wrapperClasses;
    }

    getContentClasses(theme: string,
                      backgroundColorStyle: string,
                      cursor: string = 'pointer',
                      templateHighlightOnHover: boolean = true): string {
        const hoverBackgroundStyle = this._$owner.getHoverBackgroundStyle() || 'default';

        let contentClasses = '';
        if (this._$owner.getMultiSelectVisibility() === 'onhover' && !this._$owner.isSelected()) {
            contentClasses += ' controls-ListView__checkbox-onhover';
        }

        if (templateHighlightOnHover !== false) {
            contentClasses += ` controls-Grid__item_background-hover_${hoverBackgroundStyle}_theme-${theme}`;
        }
        return contentClasses;
    }

    getTemplate(multiSelectTemplate: TemplateFunction): TemplateFunction|string {
        return multiSelectTemplate;
    }

    shouldDisplayMarker(marker: boolean, markerPosition: 'left' | 'right' = 'left'): boolean {
        return markerPosition !== 'right' && marker !== false && this._$owner.isMarked();
    }

    shouldDisplayItemActions(): boolean {
        return false;
    }

    getColspan() {
        return undefined;
    };
    getRowspan() {
        return undefined;
    };
    getColspanStyles() {
        return '';
    };
    getRowspanStyles() {
        return '';
    };
}

Object.assign(GridCheckboxCell.prototype, {
    '[Controls/_display/GridCheckboxCell]': true,
    _moduleName: 'Controls/display:GridCheckboxCell',
    _instancePrefix: 'grid-checkbox-cell-',
    _$style: null
});
