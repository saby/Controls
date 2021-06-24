import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!Controls-demo/list_new/ColumnsView/DragNDropWithFolders/Template');
import {Memory} from 'Types/source';
import { SyntheticEvent } from 'UI/Vdom';
import {Collection} from 'Controls/display';
import {Model} from 'Types/entity';

export default class RenderDemo extends Control {
    protected _template: TemplateFunction = template;
    protected _viewSource: Memory;
    private _dataArray: Array<{id: number, title: string, parent: string, node: boolean|null}>;
    protected _selectedKeys: Number[] = [];

    protected _beforeMount(): void {
        this._dataArray = [
            {id: 1, title: 'Папка 1', parent: null, node: true},
            {id: 2, title: 'Папка 2', parent: null, node: true},
            {id: 3, title: 'Папка 3', parent: null, node: true},
            {id: 4, title: 'Папка 4', parent: null, node: true},
            {id: 5, title: 'Запись 1', parent: null, node: null},
            {id: 6, title: 'Запись 2', parent: null, node: null},
            {id: 7, title: 'Запись 3', parent: null, node: null},
            {id: 8, title: 'Запись 4', parent: null, node: null},
            {id: 9, title: 'Запись 5', parent: null, node: null},
            {id: 10, title: 'Запись 6', parent: null, node: null},
            {id: 11, title: 'Запись 7', parent: null, node: null}
        ];
        this._viewSource = new Memory({
            data: this._dataArray,
            keyProperty: 'id'
        });
    }

    protected _dragEnd(_: SyntheticEvent, entity: Collection<Model>, target: unknown, position: string): void {
        return this._children.listMover.moveItems(entity.getItems(), target, position);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
