import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!Controls-demo/list_new/ColumnsView/DragNDrop/Template');
import {Memory} from 'Types/source';
import {generateData} from '../../DemoHelpers/DataCatalog';
import { SyntheticEvent } from 'UI/Vdom';
import * as Dnd from 'Controls/dragnDrop';
import {Collection} from 'Controls/display';
import {Model} from 'Types/entity';

const NUMBER_OF_ITEMS = 200 ;

export default class RenderDemo extends Control {
    protected _template: TemplateFunction = template;
    protected _viewSource: Memory;
    private _dataArray: Array<{id: number, title: string}>;
    protected _selectedKeys: Number[] = [];

    protected _beforeMount(): void {
        this._dataArray = generateData<{id: number, key: number, title: string}>({
            count: NUMBER_OF_ITEMS,
            entityTemplate: {title: 'string'},
            beforeCreateItemCallback: (item) => {
                item.title = `Запись с key="${item.id}". `;
                item.key = item.id;
            }
        });
        this._viewSource = new Memory({
            data: this._dataArray,
            keyProperty: 'key'
        });
    }

    protected _dragStart(_: SyntheticEvent, items: number[]): Dnd.ItemsEntity {
        return new Dnd.ItemsEntity({
            items,
        });
    }

    protected _dragEnd(_: SyntheticEvent, entity: Collection<Model>, target: unknown, position: string): void {
        return this._children.listMover.moveItems(entity.getItems(), target, position);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
