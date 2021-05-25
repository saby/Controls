import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/NodeTypeProperty/DynamicParentProperty/DynamicParentProperty';
import {CrudEntityKey, Memory} from 'Types/source';
import {extendedData as data} from '../data/NodeTypePropertyData';
import {TColspanCallbackResult} from 'Controls/grid';
import {Model} from 'Types/entity';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _expandedItems: CrudEntityKey[] = [null];
    protected _collapsedItems: CrudEntityKey[] = undefined;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data
        });
    }

    protected _colspanCallback(item: Model, column, columnIndex: number, isEditing: boolean): TColspanCallbackResult {
        if (typeof item === 'string' || item.get('nodeType') === 'group') {
            return 'end';
        }
        return 1;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
