import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/ItemPadding/Master/ItemPadding';
import {Memory} from 'Types/source';
import {getFewCategories as getData} from '../../DemoHelpers/DataCatalog';
import 'css!Controls/masterDetail';
import 'css!Controls/CommonClasses';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
