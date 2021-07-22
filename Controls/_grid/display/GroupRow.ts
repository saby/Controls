import { TemplateFunction } from 'UI/Base';
import { mixin } from 'Types/util';
import { Model as EntityModel } from 'Types/entity';

import {
    ExpandableMixin,
    IExpandableMixinOptions,
    ICollectionItemOptions as IBaseCollectionItemOptions,
    GridLadderUtil
} from 'Controls/display';

import DataRow from './DataRow';
import DataCell from './DataCell';
import Collection from './Collection';
import {IColumn} from 'Controls/grid';
import {TColspanCallbackResult} from 'Controls/_grid/display/mixins/Grid';
import {IOptions as IGroupCellOptions} from 'Controls/_grid/display/GroupCell';
import {IItemTemplateParams} from 'Controls/_grid/display/mixins/Row';
import ItemActionsCell from 'Controls/_grid/display/ItemActionsCell';

const GROUP_Z_INDEX_DEFAULT = 2;
const GROUP_Z_INDEX_WITHOUT_HEADERS_AND_RESULTS = 3;
export interface IOptions<T> extends IBaseCollectionItemOptions<T>, IExpandableMixinOptions {
    owner: Collection<T>;
    metaResults: EntityModel;
}

export default class GroupRow<T> extends mixin<
    DataRow<any>,
    ExpandableMixin
    >(
    DataRow,
    ExpandableMixin
) {
    readonly '[Controls/_display/IEditableCollectionItem]': boolean = false;
    readonly '[Controls/_display/GroupItem]': true;

    readonly Markable: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly EnumerableItem: boolean = false;
    readonly EdgeRowSeparatorItem: boolean = true;
    readonly DisplayItemActions: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly LadderSupport: boolean = false;
    readonly ItemActionsItem: boolean = false;
    readonly '[Controls/_display/grid/GroupRow]': true;

    protected _$columnItems: Array<DataCell<T>>;
    protected _groupTemplate: TemplateFunction|string;
    protected _$metaResults: EntityModel;
    protected _$colspanGroup: boolean;

    constructor(options?: IOptions<T>) {
        super(options);
        ExpandableMixin.call(this);
    }

    get key(): T {
        return this._$contents;
    }

    isHiddenGroup(): boolean {
        return this._$contents === 'CONTROLS_HIDDEN_GROUP';
    }

    getGroupPaddingClasses(theme: string, side: 'left' | 'right'): string {
        if (side === 'left') {
            const spacing = this.getOwner().getLeftPadding().toLowerCase();
            const hasMultiSelect = this.hasMultiSelectColumn();
            return `controls-ListView__groupContent__leftPadding_${hasMultiSelect ? 'withCheckboxes' : spacing}`;
        } else {
            const spacing = this.getOwner().getRightPadding().toLowerCase();
            return `controls-ListView__groupContent__rightPadding_${spacing}`;
        }
    }

    // FIXME: перебитие метода с другой сигнатурой + сайд эффект в виде установки шаблона при вызове метода getSmth
    getTemplate(
        itemTemplateProperty: string,
        userItemTemplate: TemplateFunction|string,
        userGroupTemplate?: TemplateFunction|string
    ): TemplateFunction|string {
        if (userGroupTemplate) {
            this._groupTemplate = userGroupTemplate;
        } else {
            this._groupTemplate = null;
        }
        return 'Controls/grid:ItemTemplate';
    }

    isSticked(): boolean {
        return this._$owner.isStickyHeader() && !this.isHiddenGroup();
    }

    getStickyColumn(): GridLadderUtil.IStickyColumn {
        return this._$owner.getStickyColumn();
    }

    getItemClasses(params: IItemTemplateParams = { theme: 'default' }): string {
        return `${this._getBaseItemClasses(params.style, params.theme)} ` +
               `${this._getCursorClasses(params.cursor, params.clickable)} ` +
               `controls-ListView__group${this.isHiddenGroup() ? 'Hidden' : ''}`;
    }

    protected _getBaseItemClasses(style: string, theme: string): string {
        let itemClasses = 'controls-ListView__itemV';
        if (!this.isHiddenGroup()) {
            itemClasses += ` controls-Grid__row controls-Grid__row_${style}`;
        }
        return itemClasses;
    }

    getStickyHeaderMode(): string {
        return 'replaceable';
    }

    getStickyHeaderPosition(): {} {
        return {
            vertical: 'top'
        };
    }

    getStickyHeaderZIndex(): number {
        return (this.hasHeader() || this.getResultsPosition()) ? GROUP_Z_INDEX_DEFAULT : GROUP_Z_INDEX_WITHOUT_HEADERS_AND_RESULTS;
    }
    setExpanded(expanded: boolean, silent?: boolean): void {
        super.setExpanded(expanded, silent);
        this._nextVersion();
    }

    getMetaResults(): EntityModel {
        return this._$metaResults;
    }

    getColspanGroup(): boolean {
        return this._$colspanGroup;
    }

    setColspanGroup(colspanGroup: boolean): void {
        if (this._$colspanGroup !== colspanGroup) {
            this._$colspanGroup = colspanGroup;
            this._reinitializeColumns();
        }
    }

    protected _getColspan(column: IColumn, columnIndex: number): TColspanCallbackResult {
        if (!this._$colspanGroup && this.hasColumnScroll() && (columnIndex < this.getStickyColumnsCount())) {
            return this.getStickyColumnsCount();
        } else {
            return 'end';
        }
    }

    protected _initializeColumns(): void {

        // TODO: Перевезти на базовый механизм, аналогично подвалу, результатам и пустому представлению.
        //  Все методы уже есть для этого

        if (this._$columnsConfig) {
            this._$columnItems = this._prepareColumnItems(
                this._$columnsConfig,
                this.getColumnsFactory(),
                true,
                true,
                true
            );
            this._processStickyLadderCells();

            if (this.hasItemActionsSeparatedCell()) {
                this._$columnItems.push(new ItemActionsCell({
                    owner: this,
                    instanceId: `${this.key}_column_separated-actions`,
                    // FIXME: Ну как же ноль, если это последняя ячейка.
                    ...this._getColumnFactoryParams({}, 0),
                    column: {}
                }));
            }
        }
    }

    protected _getColumnFactoryParams(column: IColumn, columnIndex: number): Partial<IGroupCellOptions<T>> {
        return {
            ...super._getColumnFactoryParams(column, columnIndex),
            columnsLength: this._$columnsConfig.length,
            column: {},
            contents: this.getContents(),
			zIndex: this.getStickyHeaderZIndex(),
            metaResults: this.getMetaResults(),
            groupTemplate: this._groupTemplate,
            colspanGroup: this._$colspanGroup
        };
    }
}

Object.assign(GroupRow.prototype, {
    '[Controls/_display/GroupItem]': true,
    '[Controls/_display/grid/GroupRow]': true,
    _moduleName: 'Controls/grid:GridGroupRow',
    _cellModule: 'Controls/grid:GridGroupCell',
    _instancePrefix: 'grid-group-item-',
    _$colspanGroup: true,
    _$metaResults: null
});
