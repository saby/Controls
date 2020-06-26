import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/_grid/interface/IColumn';

import {Gadgets} from '../DemoHelpers/DataCatalog';

interface BaseIndexOptions extends IControlOptions {
    showTitle: boolean;
}

export default class extends Control<BaseIndexOptions> {
    protected _template: TemplateFunction;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Gadgets.getColumnsForFlat();
    protected _showTitle: boolean;

    protected _beforeMount(options?: BaseIndexOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._showTitle = !options || options.showTitle !== false;;
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
