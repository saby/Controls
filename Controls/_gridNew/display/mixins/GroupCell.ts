export default abstract class GroupCell<T> {
    readonly '[Controls/_display/grid/mixins/GroupCell]': boolean;

    getContentClasses(theme: string): string {
        let classes = '';
        classes += ` controls-Grid__row-cell__content_baseline_default_theme-${theme}`;
        classes += this._getContentAlignClasses();
        classes += ' controls-ListView__groupContent';
        return classes;
    }

    getContentTextClasses(theme: string): string {
        return 'controls-ListView__groupContent-text ' +
            `controls-ListView__groupContent-text_theme-${theme} ` +
            `controls-ListView__groupContent-text_default_theme-${theme} `;
    }

    getExpanderClasses(expanderVisible: boolean = true,
                       expanderAlign: 'right' | 'left' = 'left',
                       theme: string = 'default'): string {
        let classes = '';
        if (expanderVisible !== false) {
            if (!this.isExpanded()) {
                classes += ' controls-ListView__groupExpander_collapsed';
                classes += ` controls-ListView__groupExpander_collapsed_${expanderAlign}`;
            }

            classes += ` controls-ListView__groupExpander controls-ListView__groupExpander_theme-${theme}` +
                ` controls-ListView__groupExpander_${expanderAlign}_theme-${theme}` +
                ` controls-ListView__groupExpander-iconSize_default_theme-${theme}`;

            classes += ' js-controls-Tree__row-expander';
        }
        return classes;
    }

    shouldDisplayLeftSeparator(separatorVisibility: boolean,
                               textVisible: boolean,
                               columnAlignGroup: number,
                               textAlign: string): boolean {
        return separatorVisibility !== false && textVisible !== false &&
            (columnAlignGroup !== undefined || textAlign !== 'left');
    }

    shouldDisplayRightSeparator(separatorVisibility: boolean,
                                textVisible: boolean,
                                columnAlignGroup: number,
                                textAlign: string): boolean {
        return separatorVisibility !== false &&
            (columnAlignGroup !== undefined || textAlign !== 'right' || textVisible === false);
    }

    protected _getWrapperSeparatorClasses(theme: string): string {
        let classes = '';
        classes += ' controls-Grid__no-rowSeparator';
        classes += ' controls-Grid__row-cell_withRowSeparator_size-null';
        return classes;
    }

    protected _getWrapperBaseClasses(theme: string, style: string, templateHighlightOnHover: boolean): string {
        let classes = '';
        classes += ` controls-Grid__row-cell controls-Grid__cell_${style}`;
        classes += ` controls-Grid__row-cell_${style}_theme-${theme}`;
        classes += ` controls-Grid__row-cell_small_min_height-theme-${theme} `;

        return classes;
    }

    abstract isExpanded(): boolean;
    abstract _getHorizontalPaddingClasses(theme: string): string;
    abstract _getContentAlignClasses(): string;
}
