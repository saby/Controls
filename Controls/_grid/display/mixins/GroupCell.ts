export default abstract class GroupCell<T> {
    readonly '[Controls/_display/grid/mixins/GroupCell]': boolean;

    getContentClasses(theme: string): string {
        let classes = '';
        // TODO необходимо разобраться с высотой групп.
        //  https://online.sbis.ru/opendoc.html?guid=6693d47c-515c-4751-949d-55be05fe124e
        classes += ` controls-Grid__row-cell__content_baseline_S`;
        classes += this._getHorizontalPaddingClasses(theme);
        classes += this._getContentAlignClasses();
        classes += ' controls-ListView__groupContent';
        return classes;
    }

    getContentTextClasses(separatorVisibility: boolean,
                          textAlign: 'right' | 'left'): string {
        let classes = 'controls-ListView__groupContent-text ' +
            'controls-ListView__groupContent-text_default';

        classes += ` controls-ListView__groupContent_${textAlign || 'center'}`;

        if (separatorVisibility === false) {
            classes += ' controls-ListView__groupContent-withoutGroupSeparator';
        }
        return classes;
    }

    getExpanderClasses(expanderVisible: boolean = true,
                       expanderAlign: 'right' | 'left' = 'left'): string {
        let classes = '';
        if (expanderVisible !== false) {
            if (!this.isExpanded()) {
                classes += ' controls-ListView__groupExpander_collapsed';
                classes += ` controls-ListView__groupExpander_collapsed_${expanderAlign}`;
            }

            classes += ` controls-ListView__groupExpander ` +
                ` controls-ListView__groupExpander_${expanderAlign}` +
                ` controls-ListView__groupExpander-iconSize_default`;

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
        classes += ` controls-Grid__row-cell_${style}`;
        classes += ' controls-Grid__row-cell_small_min_height ';

        return classes;
    }

    abstract isExpanded(): boolean;
    abstract _getHorizontalPaddingClasses(theme: string): string;
    abstract _getContentAlignClasses(): string;
}
