import {TemplateFunction} from 'UI/Base';

import {IMarkable, ISelectableItem} from 'Controls/display';

import Row, {IOptions as IRowOptions} from './Row';
import DataCell, { IOptions as IGridDataCellOptions } from './DataCell';
import ILadderSupport from './interface/ILadderSupport';
import { IDisplaySearchValue, IDisplaySearchValueOptions } from './interface/IDisplaySearchValue';
import { IColumn, TColumns } from './interface/IColumn';
import { Model } from 'Types/entity';

export interface IOptions<T> extends IRowOptions<T>, IDisplaySearchValueOptions {
}

export default class DataRow<T extends Model> extends Row<T> implements
    IMarkable,
    ILadderSupport,
    ISelectableItem,
    IDisplaySearchValue {
    protected _$columnItems: Array<DataCell<T, this>>;
    protected _$searchValue: string;

    readonly '[Controls/_display/IEditableCollectionItem]': boolean = true;
    readonly DisplayItemActions: boolean = true;
    readonly DisplaySearchValue: boolean = true;
    readonly LadderSupport: boolean = true;
    readonly Markable: boolean = true;
    readonly SelectableItem: boolean = true;
    readonly EnumerableItem: boolean = true;
    readonly EdgeRowSeparatorItem: boolean = true;
    readonly DraggableItem: boolean = true;
    readonly ItemActionsItem: boolean = true;
    private _$editingColumnIndex: number;
    protected _$hasStickyGroup: boolean;

    constructor(options?: IOptions<T>) {
        super(options);
    }

    getTemplate(itemTemplateProperty: string, userTemplate: TemplateFunction|string): TemplateFunction|string {
        const templateFromProperty = itemTemplateProperty ? this.getContents().get(itemTemplateProperty) : '';
        return templateFromProperty || userTemplate || this.getDefaultTemplate();
    }

    setGridColumnsConfig(columns: TColumns): void {
        this.setColumnsConfig(columns);
    }

    protected _getColumnFactoryParams(column: IColumn, columnIndex: number): Partial<IGridDataCellOptions<T>> {
        return {
            ...super._getColumnFactoryParams(column, columnIndex),
            searchValue: this._$searchValue,
            markerPosition: this.getMarkerPosition()
        };
    }

    setSearchValue(searchValue: string): void {
        super.setSearchValue(searchValue);
        if (this._$columnItems) {
            this._$columnItems.forEach((cell, cellIndex) => {
                if (cell.DisplaySearchValue) {
                    cell.setSearchValue(searchValue);
                }
            });
        }
    }

    getSearchValue(): string {
        return this._$searchValue;
    }

    setEditing(editing: boolean, editingContents?: T, silent?: boolean, columnIndex?: number): void {
        super.setEditing(editing, editingContents, silent, columnIndex);
        if (typeof columnIndex === 'number' && this._$editingColumnIndex !== columnIndex) {
            this._$editingColumnIndex = columnIndex;
        }

        // FIXME: Временное решение - аналог RowEditor из старых таблиц(редактирование во всю строку).
        //  Первая ячейка редактируемой строки растягивается, а ее шаблон заменяется на
        //  itemEditorTemplate (обычная колонка с прикладным контентом).
        //  Избавиться по https://online.sbis.ru/opendoc.html?guid=80420a0d-1f45-4acb-8feb-281bf1007821
        this.setRowTemplate(editing ? this._$owner.getItemEditorTemplate() : undefined);
        this._reinitializeColumns();
    }

    getEditingColumnIndex(): number {
        return this._$editingColumnIndex;
    }

    setHasStickyGroup(hasStickyGroup: boolean): void {
        if (this._$hasStickyGroup !== hasStickyGroup) {
            this._$hasStickyGroup = hasStickyGroup;
            this._nextVersion();
        }
    }

    _initializeColumns(): void {
        super._initializeColumns({
            colspanStrategy: 'skipColumns',
            shouldAddStickyLadderCells: !this._$rowTemplate
        });
    }

    hasStickyGroup(): boolean {
        return this._$hasStickyGroup;
    }

    updateContentsVersion(): void {
        this._nextVersion();
        this._redrawColumns('all');
    }
}

Object.assign(DataRow.prototype, {
    '[Controls/_display/grid/DataRow]': true,
    _moduleName: 'Controls/grid:GridDataRow',
    _cellModule: 'Controls/grid:GridDataCell',
    _instancePrefix: 'grid-data-row-',
    _$editingColumnIndex: null,
    _$searchValue: '',
    _$hasStickyGroup: false
});
