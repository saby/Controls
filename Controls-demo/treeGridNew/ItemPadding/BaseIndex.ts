import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';

import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

interface IBaseIndexOptions extends IControlOptions {
    showTitle: boolean;
}

export default class extends Control<IBaseIndexOptions> {
    protected _template: TemplateFunction;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = [
        {
            displayProperty: 'title'
        }
    ];
    protected _showTitle: boolean;

    protected _beforeMount(options?: IBaseIndexOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._showTitle = !options || options.showTitle !== false;
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Flat.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
