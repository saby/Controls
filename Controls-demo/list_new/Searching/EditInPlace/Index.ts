import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/Searching/EditInPlace/EditInPlace';
import {Memory} from 'Types/source';
import {getFewCategories as getData} from '../../DemoHelpers/DataCatalog';
import {View as List} from 'Controls/list';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _filter: Object = {};
    private _fakeItemId: number = 1000;

    protected _children: {
        list: List
    };

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }

    protected _beginAdd(): void {
        this._children.list.beginAdd({
            item: new Model({
                keyProperty: 'id',
                rawData: {id: ++this._fakeItemId, title: ''}
            })
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
