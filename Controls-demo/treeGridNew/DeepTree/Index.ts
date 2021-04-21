import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/DeepTree/DeepTree';
import {CrudEntityKey, Memory} from 'Types/source';
import {Gadgets} from '../DemoHelpers/DataCatalog';
import * as elipsisTpl from 'wml!Controls-demo/treeGridNew/DeepTree/elipsisTpl';
import { IColumn } from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Gadgets.getColumnsWithFixedWidth().map((cur) => ({
        ...cur, template: elipsisTpl
    }));
    // tslint:disable-next-line
    protected _expandedItems: CrudEntityKey[] = [1, 11, 111, 1111, 11111, 111111, 2, 22, 222, 2222];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getDeepSet()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
