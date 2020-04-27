import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!Controls-demo/list_new/ColumnsView/MasterDetail/MasterDetail');
import columnTemplate = require('wml!Controls-demo/DragNDrop/MasterDetail/itemTemplates/masterItemTemplate');
import * as data from 'Controls-demo/DragNDrop/MasterDetail/Data';
import cInstance = require('Core/core-instance');
import {Memory as MemorySource, Memory} from 'Types/source';
import {generateData} from '../../DemoHelpers/DataCatalog';
import {ListItems} from 'Controls/dragnDrop';
import * as TaskEntity from 'Controls-demo/DragNDrop/MasterDetail/TasksEntity';
import {TItemKey} from 'Controls/_display/interface';

const NUMBER_OF_ITEMS = 50;

export default class RenderDemo extends Control {
    protected _template: TemplateFunction = template;
    protected gridColumns = [{
        displayProperty: 'name',
        width: '1fr',
        template: columnTemplate
    }];

    protected _viewSource: Memory;

    protected _navigation: any;
    protected _selectedKeys: [TItemKey];
    protected _items: [object];

    private _dataArray: Array<{id: number, title: string, description: string}>;

    _initSource() {
        this._detailSource = new Memory({
            keyProperty: 'id',
            data: data.detail
        });

        this._masterSource = new Memory({
            keyProperty: 'id',
            data: data.master
        });
    }

    protected _beforeMount(): void {
        this._initSource();
        this._itemsReadyCallbackMaster = this._itemsReadyMaster.bind(this);
        this._itemsReadyCallbackDetail = this._itemsReadyDetail.bind(this);
    }
    _afterMount() {
        this._initSource();
    }
    _itemsReadyMaster(items) {
        this._itemsMaster = items;
    }

    _itemsReadyDetail(items) {
        this._itemsDetail = items;
    }

    _dragEnterMaster(event, entity) {
        return cInstance.instanceOfModule(entity, 'Controls-demo/DragNDrop/MasterDetail/TasksEntity');
    }

    _dragStartMaster(event, items) {
        var firstItem = this._itemsMaster.getRecordById(items[0]);

        return new ListItems({
            items: items,
            mainText: firstItem.get('name')
        });
    }
    _dragStartDetail(event, items) {
        var firstItem = this._itemsDetail.getRecordById(items[0]);

        return new TaskEntity({
            items: items,
            mainText: firstItem.get('name'),
            image: firstItem.get('img'),
            additionalText: firstItem.get('shortMsg')
        });
    }

    _dragEndMaster(event, entity, target, position) {
        var
            item,
            targetId,
            items = entity.getItems();

        if (cInstance.instanceOfModule(entity, 'Controls-demo/DragNDrop/MasterDetail/TasksEntity')) {
            targetId = target.get('id');
            items.forEach(function(id) {
                item = this._itemsDetail.getRecordById(id);
                item.set('parent', targetId);
                this._detailSource.update(item);
            }, this);
            this._children.detailList.reload();
            this._selectedKeys = [];
        } else {
            this._children.masterMover.moveItems(items, target, position);
        }
    }

    _dragEndDetail(event, entity, target, position) {
        this._children.detailMover.moveItems(entity.getItems(), target, position);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/DragNDrop/MasterDetail/MasterDetail'];
}
