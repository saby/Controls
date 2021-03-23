export default abstract class GroupCell<T> {
    readonly '[Controls/_display/grid/mixins/GroupCell]': boolean;

    getContentClasses(theme: string): string {
        let classes = '';
        // TODO необходимо разобраться с высотой групп. По стандарту группы должны быть высотой 18px, а
        //  не 24/22 как сейчас в зависимости от наличия separator.
        //  нужно разобраться, как сделать группу высотой 18px с выровненными по baseLine элементами, и
        //  скорее всего использовать вместо font-иконок svg:
        //  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        //      <path d="{{ (gridColumn || itemData).isExpanded() ?
        //              'M8,11.22,2.41,5.59l.81-.81L8,9.53l4.78-4.75.81.84Z' :
        //              'M5.63,13.59l-.84-.84L9.53,8,4.78,3.22l.81-.81L11.22,8Z' }}"/>
        //  </svg>
        //  Нужно учесть, что это повлияет и на группы в плоском списке, соответственно, там тоже поменяется шаблон.
        classes += ` controls-Grid__row-cell__content_baseline_S_theme-${theme}`;
        classes += this._getHorizontalPaddingClasses(theme);
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
