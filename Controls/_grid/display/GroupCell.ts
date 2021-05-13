import { TemplateFunction } from 'UI/Base';
import {Model as EntityModel, OptionsToPropertyMixin} from 'Types/entity';
import { mixin } from 'Types/util';

import { IColspanParams, IColumn } from 'Controls/interface';
import { default as GridGroupCellMixin } from 'Controls/_grid/display/mixins/GroupCell';

import DataCell from './DataCell';
import GroupRow from './GroupRow';

export interface IOptions<T> {
    owner: GroupRow<T>;
    column: IColumn;
    columnsLength: number;
    contents: string;
    groupTemplate: TemplateFunction|string;
    zIndex?: number;
    metaResults: EntityModel;
}

export default class GroupCell<T>
    extends mixin<DataCell<any, GroupRow<any>>, GridGroupCellMixin<any>>(DataCell, GridGroupCellMixin) {
    protected _$columnsLength: number;
    protected _$contents: string;
    protected _$zIndex: number;
    protected _$groupTemplate: TemplateFunction|string;
    protected _$metaResults: EntityModel;

    constructor(options?: IOptions<T>) {
        super(options);
        OptionsToPropertyMixin.call(this, options);
    }

    // region overrides

    getWrapperStyles(): string {
        return this.getColspanStyles();
    }

    getZIndex(): number {
        return this._$zIndex;
    }

    getContentStyles(): string {
        return 'display: contents;';
    }

    _getColspanParams(): IColspanParams {
        const hasMultiSelect = this._$owner.hasMultiSelectColumn();
        const ladderStickyColumn = this._$owner.getStickyColumn();
        const ladderColumnLength = ladderStickyColumn ? ladderStickyColumn.property.length : 0;
        const startColumn = hasMultiSelect ? 2 : 1;
        const endColumn = startColumn + this._$columnsLength + ladderColumnLength;
        return {
            startColumn,
            endColumn
        };
    }

    getTemplate(multiSelectTemplate?: TemplateFunction): TemplateFunction|string {
        return this._$groupTemplate;
    }

    // endregion overrides

    // region Аспект "Рендер"

    getDefaultDisplayValue(): string {
        return this._$contents;
    }

    // endregion Аспект "Рендер"

    // region Аспект "Ячейка группы"

    getRightTemplateClasses(separatorVisibility: boolean,
                            textVisible: boolean,
                            columnAlignGroup: number): string {
        let classes = `controls-ListView__groupContent-rightTemplate`;
        const groupPaddingClasses = this._$owner.getGroupPaddingClasses(undefined, 'right');

        if (!this._shouldFixGroupOnColumn(columnAlignGroup, textVisible)) {
            classes += ' ' + groupPaddingClasses;
        }

        // should add space before rightTemplate
        if (separatorVisibility === false && textVisible === false) {
            classes += ' controls-ListView__groupContent-withoutGroupSeparator controls-ListView__groupContent_right';
        }

        return classes;
    }

    getMetaResults(): EntityModel {
        return this._$metaResults;
    }

    isExpanded(): boolean {
        return this._$owner.isExpanded();
    }

    protected _shouldFixGroupOnColumn(columnAlignGroup: number, textVisible: boolean): boolean {
        return textVisible !== false &&
            columnAlignGroup !== undefined &&
            columnAlignGroup < this._$columnsLength - (this._$owner.hasMultiSelectColumn() ? 1 : 0);
    }

    // endregion Аспект "Ячейка группы"
}

Object.assign(GroupCell.prototype, {
    '[Controls/_display/grid/GroupCell]': true,
    _moduleName: 'Controls/grid:GridGroupCell',
    _instancePrefix: 'grid-group-cell-',
    _$owner: null,
    _$columnsLength: null,
    _$zIndex: 2,
    _$contents: null,
    _$groupTemplate: 'Controls/grid:GroupTemplate',
    _$metaResults: null
});
