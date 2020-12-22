import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/KeyProperty/Error/Error';
import {Memory} from 'Types/source';
import {getFewCategories as getData} from '../../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            data: getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
