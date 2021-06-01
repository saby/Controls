import {Control, TemplateFunction} from 'UI/Base';
import {CrudEntityKey, Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {IColumn, TColspanCallbackResult} from 'Controls/grid';

import {dynamicParentData as data} from '../data/NodeTypePropertyData';
import {DynamicParentModelName} from './DynamicParentModel';

import * as Template from 'wml!Controls-demo/treeGridNew/NodeTypeProperty/DynamicParentProperty/DynamicParentProperty';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _expandedItems: CrudEntityKey[] = [null];
    protected _collapsedItems: CrudEntityKey[] = undefined;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data,
            model: DynamicParentModelName
        });
    }

    protected _colspanCallback(item: Model, column: IColumn, columnIndex: number, isEditing: boolean): TColspanCallbackResult {
        if (typeof item === 'string' || item.get('nodeType') === 'group') {
            return 'end';
        }
        return 1;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
