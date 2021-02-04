import {OptionsToPropertyMixin} from 'Types/entity';

import {IColspanParams, IColumn} from 'Controls/_grid/interface/IColumn';

import Cell from './Cell';
import GroupItem from './GroupItem';

export interface IOptions<T> {
    owner: GroupItem<T>;
    column: IColumn;
    columns: IColumn[];
}

export default class GroupCell<T> extends Cell<T, GroupItem<T>> {
    protected _$columns: IColumn[];

    constructor(options?: IOptions<T>) {
        super(options);
        OptionsToPropertyMixin.call(this, options);
    }

    getWrapperClasses(): string {
        return '';
    }

    getWrapperStyles(): string {
        return this.getColspan();
    }

    getContentClasses(): string {
        return '';
    }

    getContentStyles(): string {
        return 'display: contents;';
    }

    // region Аспект "Объединение колонок"
    _getColspanParams(): IColspanParams {
        const hasMultiSelect = this._$owner.hasMultiSelectColumn();
        const ladderStickyColumn = this._$owner.getStickyColumn();
        const ladderColumnLength = ladderStickyColumn ? ladderStickyColumn.property.length : 0;
        const startColumn = hasMultiSelect ? 2 : 1;
        const endColumn = startColumn + this._$columns.length + ladderColumnLength;
        return {
            startColumn,
            endColumn
        };
    }

    // endregion

    getGroupWrapperClasses(expanderVisible: boolean, theme: string): string {
        const leftPadding = this._$owner.getLeftPadding().toLowerCase();
        const rightPadding = this._$owner.getRightPadding().toLowerCase();

        return 'controls-ListView__groupContent' +
            (expanderVisible === false ? ' controls-ListView__groupContent_cursor-default' : '') +
            ` controls-Grid__groupContent__spacingLeft_${leftPadding}_theme-${theme}` +
            ` controls-Grid__groupContent__spacingRight_${rightPadding}_theme-${theme}`;
    }

    getCaptionClasses(expanderAlign, expanderVisible: boolean, theme: string) {
        const expander = expanderAlign === 'right' ? 'right' : 'left';

        let classes = 'controls-ListView__groupContent-text ' +
            `controls-ListView__groupContent-text_theme-${theme} ` +
            `controls-ListView__groupContent-text_default_theme-${theme} `;

        if (expanderVisible !== false) {
            if (!this.isExpanded()) {
                classes += ' controls-ListView__groupExpander_collapsed';
                classes += ` controls-ListView__groupExpander_collapsed_${expander}`;
            }

            classes += ` controls-ListView__groupExpander controls-ListView__groupExpander_theme-${theme}` +
                ` controls-ListView__groupExpander_${expander}_theme-${theme}` +
                ` controls-ListView__groupExpander-iconSize_default_theme-${theme}`;
        }

        return classes;
    }

    getRightTemplateClasses(separatorVisibility: boolean,
                            textVisible: boolean,
                            columnAlignGroup: number,
                            textAlign: string,
                            theme: string): string {
        let classes = `controls-ListView__groupContent-rightTemplate_theme-${theme}`;
        const groupPaddingClasses = this._$owner.getGroupPaddingClasses(theme, 'right');

        if (!this._shouldFixGroupOnColumn(columnAlignGroup, textVisible)) {
            classes += ' ' + groupPaddingClasses;
        }

        // should add space before rightTemplate
        if (separatorVisibility === false && (textVisible === false ||
            (columnAlignGroup === undefined && textAlign !== 'right'))) {
            classes += ' controls-ListView__groupContent-withoutGroupSeparator';
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

    getCaption(): T {
        return this._$owner.getCaption();
    }

    isExpanded(): boolean {
        return this._$owner.isExpanded();
    }

    protected _shouldFixGroupOnColumn(columnAlignGroup: number, textVisible: boolean): boolean {
        return textVisible !== false &&
            columnAlignGroup !== undefined &&
            columnAlignGroup < this._$columns.length - (this._$owner.hasMultiSelectColumn() ? 1 : 0);
    }
}

Object.assign(GroupCell.prototype, {
    '[Controls/_display/grid/GroupCell]': true,
    _moduleName: 'Controls/display:GridGroupCell',
    _instancePrefix: 'grid-group-cell-',
    _$owner: null,
    _$columns: null
});
