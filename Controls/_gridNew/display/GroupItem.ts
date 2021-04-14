import { TemplateFunction } from 'UI/Base';
import { mixin } from 'Types/util';
import { Model as EntityModel } from 'Types/entity';

import {
    ExpandableMixin,
    IExpandableMixinOptions,
    ICollectionItemOptions as IBaseCollectionItemOptions,
    GridLadderUtil
} from 'Controls/display';

import Row from './Row';
import Cell from './Cell';
import Collection from './Collection';
import GroupCell from './GroupCell';

const DEFAULT_GROUP_CONTENT_TEMPLATE = 'Controls/gridNew:GroupContent';
const GROUP_Z_INDEX_DEFAULT = 2;
const GROUP_Z_INDEX_WITHOUT_HEADERS_AND_RESULTS = 3;

export interface IOptions<T> extends IBaseCollectionItemOptions<T>, IExpandableMixinOptions {
    owner: Collection<T>;
}

export default class GroupItem<T> extends mixin<
    Row<any>,
    ExpandableMixin
    >(
    Row,
    ExpandableMixin
) {
    readonly '[Controls/_display/IEditableCollectionItem]': boolean = false;
    readonly '[Controls/_display/GroupItem]': true;

    readonly Markable: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly '[Controls/_display/grid/GroupItem]': true;

    protected _$columnItems: Array<Cell<T>>;
    protected _$metaResults: EntityModel;
    protected _groupTemplate: TemplateFunction|string;

    constructor(options?: IOptions<T>) {
        super({...options, columns: options.owner.getColumnsConfig()});
        ExpandableMixin.call(this);
    }

    get key(): T {
        return this._$contents;
    }

    isHiddenGroup(): boolean {
        return this._$contents === 'CONTROLS_HIDDEN_GROUP';
    }

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
        return 'Controls/gridNew:ItemTemplate';
    }

    isSticked(): boolean {
        return this._$owner.isStickyHeader() && !this.isHiddenGroup();
    }

    getStickyColumn(): GridLadderUtil.IStickyColumn {
        return this._$owner.getStickyColumn();
    }

    getCaption(): T {
        return this.contents;
    }

    getItemClasses(): string {
        return 'controls-ListView__itemV controls-Grid__row controls-ListView__group ' +
                (this.isHiddenGroup() ? 'controls-ListView__groupHidden' : 'controls-Grid__row ');
    }

    getStickyHeaderMode(): string {
        return 'replaceable';
    }

    getStickyHeaderPosition(): string {
        return 'top';
    }

    getStickyHeaderZIndex(): number {
        return (this.hasHeader() || this.getResultsPosition()) ? GROUP_Z_INDEX_DEFAULT : GROUP_Z_INDEX_WITHOUT_HEADERS_AND_RESULTS;
    }

    _initializeColumns(): void {
        if (this._$columns) {
            const columns = [];

            columns.push(new GroupCell({
                owner: this,
                columns: this._$columns,
                column: { template: this._groupTemplate || DEFAULT_GROUP_CONTENT_TEMPLATE },
                zIndex: this.getStickyHeaderZIndex()
            }));

            this._$columnItems = columns;
        }
    }

    setExpanded(expanded: boolean, silent?: boolean): void {
        super.setExpanded(expanded, silent);
        this._nextVersion();
    }

    getMetaResults(): EntityModel {
        return this._$metaResults;
    }
}

Object.assign(GroupItem.prototype, {
    '[Controls/_display/GroupItem]': true,
    '[Controls/_display/grid/GroupItem]': true,
    _moduleName: 'Controls/display:GridGroupItem',
    _instancePrefix: 'grid-group-item-',
    _$columns: null,
    _$metaResults: null
});
