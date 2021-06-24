import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/ColumnScroll/DevelopmentFull/DevelopmentFull';
import * as NewColumnTemplate from 'wml!Controls-demo/gridNew/ColumnScroll/DevelopmentFull/NewColumnTemplate';
import * as PopulationColumn from 'wml!Controls-demo/gridNew/ColumnScroll/DevelopmentFull/PopulationColumn';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import { IHeader } from 'Controls-demo/types';
import {SyntheticEvent} from 'UI/Vdom';
import * as Dnd from 'Controls/dragnDrop';
import {Collection} from 'Controls/display';
import {Model} from 'Types/entity';
import {IItemAction} from 'Controls/_itemActions/interface/IItemAction';
import {getActionsForContacts as getItemActions} from 'Controls-demo/list_new/DemoHelpers/ItemActionsCatalog';

const DEFAULT_HEADER = [
    { title: '#' },
    { title: 'Страна' },
    { title: 'Столица' },
    { title: 'Население' },
    { title: 'Площадь км2' },
    { title: 'Плотность населения чел/км2' }
];

const COLSPAN_HEADER = [
    { title: 'Страна', startColumn: 1, endColumn: 3},
    { title: 'Столица', startColumn: 3, endColumn: 4 },
    { title: 'Население', startColumn: 4, endColumn: 5 },
    { title: 'Площадь км2', startColumn: 5, endColumn: 7 }
];

export default class extends Control {
    private DEFAULT_HEADER = DEFAULT_HEADER;
    private COLSPAN_HEADER = COLSPAN_HEADER;
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithWidths();
    protected _header: IHeader[] = DEFAULT_HEADER;
    protected _itemActions: IItemAction[] = [];

    private _columnScroll: boolean = true;
    private _dragScrolling: boolean = undefined;
    private _currentItemsName: 'Empty' | 'Not empty' = 'Not empty';
    private _emptyViewSource: Memory;
    private _notEmptyViewSource: Memory;
    private _newColumnWidth: string = '100px';
    private _containerWidth: string = '710px';
    private _containerWidthInputValue: string = this._containerWidth;
    private _shouldNotifyOfResize: boolean = false;
    private _stickyColumnsCount: number = 2;
    private _stickyColumnsCountInput: string = `${this._stickyColumnsCount}`;
    private _columnScrollStartPosition: undefined | 'end' = 'end';
    private _currentHeaderName: 'default' | 'colspan' | 'multiDefault' | 'multiColspan' = 'default';
    private _itemsDragNDrop: boolean = false;

    protected _beforeMount(): void {
        this._columns[2].width = '1fr';
        this._columns[3].template = PopulationColumn;
        this._emptyViewSource = new Memory({
            keyProperty: 'id',
            data: []
        });
        const data = getCountriesStats().getData();
        data[2].show = true;
        this._notEmptyViewSource = new Memory({
            keyProperty: 'id',
            data
        });
        this._viewSource = this._notEmptyViewSource;
    }

    protected _afterRender(): void {
        if (this._shouldNotifyOfResize) {
            this._shouldNotifyOfResize = false;
            this._children.resizeDetect.start();
        }
    }

    protected _dragStart(_: SyntheticEvent, draggedKeys: number[]): any {
        if (!this._itemsDragNDrop) {
            return;
        }
        let title = '';

        draggedKeys.forEach((draggedItemKey) => {
            title += this._children.grid.getItems().getRecordById(draggedItemKey).get('country') + ', ';
        });

        return new Dnd.ItemsEntity({
            items: draggedKeys,
            // tslint:disable-next-line
            title: title.trim().slice(0, title.length - 2)
        });
    }

    protected _dragEnd(_: SyntheticEvent, entity: Collection<Model>, target: unknown, position: string): void {
        if (!this._itemsDragNDrop) {
            return;
        }
        this._children.mover.moveItems(entity.getItems(), target, position);
    }

    protected _toggleDND(): void {
        this._itemsDragNDrop = !this._itemsDragNDrop;
    }

    protected _toggleItemActions(): void {
        if (this._itemActions.length) {
            this._itemActions = [];
        } else {
            this._itemActions = getItemActions();
        }
    }

    protected _toggleColumnScroll() {
        this._columnScroll = !this._columnScroll;
    }

    protected _toggleDragScrollScroll(e, value) {
        if (this._dragScrolling !== value) {
            this._dragScrolling = value;
        }
    }

    protected _toggleItems(e, val: 'Empty' | 'Not empty'): void {
        if (this._currentItemsName !== val) {
            this._currentItemsName = val;
            this._viewSource = val === 'Empty' ? this._emptyViewSource : this._notEmptyViewSource;
        }
    }

    protected _changeStickyColumnsCount(): void {
        if (this._stickyColumnsCount !== +this._stickyColumnsCountInput) {
            this._stickyColumnsCount = +this._stickyColumnsCountInput;
        }
    }

    protected _changeWidth(): void {
        if (this._containerWidth !== this._containerWidthInputValue) {
            this._containerWidth = this._containerWidthInputValue;
            this._shouldNotifyOfResize = true;
        }
    }

    protected _addColumn(): void {
        this._columns = [...this._columns, {
            template: NewColumnTemplate,
            templateOptions: {
                columnName: this._columns.length + 1
            },
            width: this._newColumnWidth
        }];
        this._header = [...this._header, {
            title: '№ ' + (this._header.length + 1)
        }];
        this.DEFAULT_HEADER = [...this.DEFAULT_HEADER, {
            title: '№ ' + (this.DEFAULT_HEADER.length + 1)
        }];
        this.COLSPAN_HEADER = [...this.COLSPAN_HEADER, {
            title: '№ ' + (this.COLSPAN_HEADER.length + 1)
        }];
    }

    protected _requestReload(): void {
    }
    protected _reload(): void {
        this._children.grid.reload();
    }

    protected _toggleColumnScrollStartPosition(e, value): void {
        if (this._columnScrollStartPosition !== value) {
            this._columnScrollStartPosition = value;
        }
    }

    protected _changeHeader(e, value: 'default' | 'colspan' | 'multiDefault' | 'multiColspan'): void {
        if (this._currentHeaderName !== value) {
            this._currentHeaderName = value;
            switch (value) {
                case 'default':
                    this._header = this.DEFAULT_HEADER;
                    break;
                case 'colspan':
                    this._header = this.COLSPAN_HEADER;
                    break;
            }
        }
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
