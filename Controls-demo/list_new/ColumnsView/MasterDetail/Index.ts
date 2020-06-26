import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!Controls-demo/list_new/ColumnsView/MasterDetail/MasterDetail');
import columnTemplate = require('wml!Controls-demo/DragNDrop/MasterDetail/itemTemplates/masterItemTemplate');
import * as data from 'Controls-demo/DragNDrop/MasterDetail/Data';
import cInstance = require('Core/core-instance');
import {Memory} from 'Types/source';
import {ListItems} from 'Controls/dragnDrop';
import * as TaskEntity from 'Controls-demo/DragNDrop/MasterDetail/TasksEntity';
import {TItemKey} from 'Controls/_display/interface';
import { TItemsReadyCallback } from 'Controls-demo/types';
import {RecordSet} from 'Types/collection';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Collection} from 'Controls/display';
import {Model} from 'Types/entity';

export default class RenderDemo extends Control {
    protected _template: TemplateFunction = template;
    protected gridColumns = [{
        displayProperty: 'name',
        width: '1fr',
        template: columnTemplate
    }];
    protected _viewSource: Memory;
    protected _navigation: any;
    protected _selectedKeys: number[];
    protected _items: [object];
    protected _detailSource: Memory;
    protected _masterSource: Memory;
    protected _itemsReadyCallbackMaster: TItemsReadyCallback;
    protected _itemsReadyCallbackDetail: TItemsReadyCallback;
    protected _itemsMaster: RecordSet;
    protected _itemsDetail: RecordSet;

    protected _dataArray: Array<{id: number, title: string, description: string}>;

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
    _afterMount(): void {
        this._initSource();
    }
    _itemsReadyMaster(items: RecordSet): void {
        this._itemsMaster = items;
    }

    _itemsReadyDetail(items: RecordSet): void {
        this._itemsDetail = items;
    }

    _dragEnterMaster(_: SyntheticEvent, entity: any) {
        return cInstance.instanceOfModule(entity, 'Controls-demo/DragNDrop/MasterDetail/TasksEntity');
    }

    _dragStartMaster(_: SyntheticEvent, items: RecordSet): any {
        var firstItem = this._itemsMaster.getRecordById(items[0]);

        return new ListItems({
            items: items,
            mainText: firstItem.get('name')
        });
    }
    _dragStartDetail(_: SyntheticEvent, items: RecordSet): any {
        var firstItem = this._itemsDetail.getRecordById(items[0]);

        return new TaskEntity({
            items: items,
            mainText: firstItem.get('name'),
            image: firstItem.get('img'),
            additionalText: firstItem.get('shortMsg')
        });
    }

    _dragEndMaster(_: SyntheticEvent, entity: Collection<Model>, target: any, position: string): void {
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
            // @ts-ignore
            this._children.detailList.reload();
            this._selectedKeys = [];
        } else {
            // @ts-ignore
            this._children.masterMover.moveItems(items, target, position);
        }
    }

    _dragEndDetail(_: SyntheticEvent, entity: Collection<Model>, target: any, position: string): void {
        // @ts-ignore
        this._children.detailMover.moveItems(entity.getItems(), target, position);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/DragNDrop/MasterDetail/MasterDetail'];
}
