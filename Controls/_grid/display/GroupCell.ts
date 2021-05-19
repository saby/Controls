import { TemplateFunction } from 'UI/Base';
import {Model as EntityModel, OptionsToPropertyMixin} from 'Types/entity';
import { mixin } from 'Types/util';

import { IColumn } from 'Controls/interface';
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

    getContentClasses(theme: string): string {
        let classes = '';
        // TODO необходимо разобраться с высотой групп.
        //  https://online.sbis.ru/opendoc.html?guid=6693d47c-515c-4751-949d-55be05fe124e
        classes += ' controls-Grid__row-cell__content_baseline_S';

        if (this.isFirstColumn()) {
            classes += ` controls-Grid__cell_spacingFirstCol_${this._$owner.getLeftPadding()}`;
        }
        if (this.isLastColumn()) {
            classes += ` controls-Grid__cell_spacingLastCol_${this._$owner.getRightPadding()}`;
        }

        classes += this._getContentAlignClasses();
        classes += ' controls-ListView__groupContent';
        return classes;
    }

    getZIndex(): number {
        return this._$zIndex;
    }

    getContentStyles(): string {
        return 'display: contents;';
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
