import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {Memory} from 'Types/source';

import {getFewCategories as getData} from '../../DemoHelpers/DataCatalog';

import * as Template from 'wml!Controls-demo/list_new/Grouped/WithoutExpander/WithoutExpander';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _viewSource: Memory;

    protected _beforeMount(options?: IControlOptions, contexts?: object, receivedState?: void): Promise<void> | void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }
}
