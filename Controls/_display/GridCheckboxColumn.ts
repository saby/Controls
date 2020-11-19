import GridColumn from './GridColumn';
import { TemplateFunction } from 'UI/Base';

export default class GridCheckboxColumn<T> extends GridColumn<T> {
    getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover: boolean): string {
        let wrapperClasses = '';

        const topPadding = this._$owner.getTopPadding();

        wrapperClasses += this._getWrapperBaseClasses(theme, style, templateHighlightOnHover);
        wrapperClasses += this._getWrapperSeparatorClasses(theme);
        wrapperClasses += ' js-controls-ListView__notEditable' +
            ' js-controls-ColumnScroll__notDraggable' +
            ` controls-GridView__checkbox_theme-${theme}` +
            ` controls-GridView__checkbox_position-default_theme-${theme}` +
            ` controls-Grid__row-cell-background-hover-default_theme-${theme}` +
            ` controls-Grid__row-checkboxCell_rowSpacingTop_${topPadding}_theme-${theme}`;
        return wrapperClasses;
    }

    getContentClasses(theme: string, cursor: string = 'pointer', templateHighlightOnHover: boolean = true): string {
        let contentClasses = '';
        if (this._$owner.getMultiSelectVisibility() === 'onhover' && !this._$owner.isSelected()) {
            contentClasses += ' controls-ListView__checkbox-onhover';
        }
        if (this._$owner.isEditing()) {
            const editingBackgroundStyle = this._$owner.getEditingBackgroundStyle();
            contentClasses += ` controls-Grid__row-cell-editing_theme-${theme}`;
            contentClasses += ` controls-Grid__row-cell-background-editing_${editingBackgroundStyle}_theme-${theme}`;
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
}

Object.assign(GridCheckboxColumn.prototype, {
    '[Controls/_display/GridCheckboxColumn]': true,
    _moduleName: 'Controls/display:GridCheckboxColumn',
    _instancePrefix: 'grid-checkbox-column-',
    _$style: null
});
