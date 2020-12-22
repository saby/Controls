import Cell from './Cell';
import {OptionsToPropertyMixin} from 'Types/entity';
import GroupItem from './GroupItem';
import {IColspanParams, IColumn} from 'Controls/_grid/interface/IColumn';
import isFullGridSupport from '../utils/GridSupportUtil';

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
       return isFullGridSupport() ? 'display: contents; ' : '';
    }

    getContentClasses(): string {
        return '';
    }

    getContentStyles(): string {
        return 'display: contents;';
    }

    // region Аспект "Объединение колонок"
    _getColspanParams(): IColspanParams {
        const hasMultiSelect = this._$owner.needMultiSelectColumn();
        const ladderStickyColumn = this._$owner.getStickyColumn();
        const ladderColumnLength = ladderStickyColumn ? ladderStickyColumn.property.length : 0;
        const startColumn = hasMultiSelect ? 2 : 1;
        const endColumn = startColumn + this._$columns.length + ladderColumnLength;
        return {
            startColumn,
            endColumn
        };
    };
    // endregion

    getGroupWrapperStyles() {
        return this.getColspan();
    }

    getGroupWrapperClasses(expanderVisible?: boolean, theme): string {
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

    getCaption(): T {
        return this._$owner.getCaption();
    }

    isExpanded(): boolean {
        return this._$owner.isExpanded();
    }
}

Object.assign(GroupCell.prototype, {
    '[Controls/_display/grid/GroupCell]': true,
    _moduleName: 'Controls/display:GridGroupCell',
    _instancePrefix: 'grid-group-cell-',
    _$owner: null,
    _$columns: null
});
