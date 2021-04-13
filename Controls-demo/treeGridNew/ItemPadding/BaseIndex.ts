import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';

import {Gadgets} from '../DemoHelpers/DataCatalog';

interface IBaseIndexOptions extends IControlOptions {
    showTitle: boolean;
}

export default class extends Control<IBaseIndexOptions> {
    protected _template: TemplateFunction;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Gadgets.getColumnsForFlat();
    protected _showTitle: boolean;

    protected _beforeMount(options?: IBaseIndexOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._showTitle = !options || options.showTitle !== false;
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
