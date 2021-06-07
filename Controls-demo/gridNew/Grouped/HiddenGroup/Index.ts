import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {Memory} from 'Types/source';
import {IColumn} from 'Controls/grid';

import {getTasksWithHiddenGroup} from '../../DemoHelpers/DataCatalog';

import * as Template from 'wml!Controls-demo/gridNew/Grouped/HiddenGroup/HiddenGroup';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = [
        {
            displayProperty: 'id',
            width: '30px'
        },
        {
            displayProperty: 'state',
            width: '200px'
        },
        {
            displayProperty: 'date',
            width: '100px'
        }
    ];

    protected _beforeMount(options?: IControlOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getTasksWithHiddenGroup().getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
