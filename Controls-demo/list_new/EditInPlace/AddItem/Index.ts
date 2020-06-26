import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/EditInPlace/AddItem/AddItem';
import {Memory} from 'Types/source';
import {getFewCategories as getData} from '../../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _fakeItemId: number = 0;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        })
    }

    protected _beginAdd(): void {
        let item = {
            id: ++this._fakeItemId,
            title: ''
        };
        //@ts-ignore
        this._children.list.beginAdd({item});
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
