import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/EditInPlace/TextArea/TextArea';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {View as List} from 'Controls/list';
import {getFewCategories as getData} from '../../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _fakeItemId: number = 1000;

    protected _children: {
        list: List
    };

    protected _beforeMount(): void {
        const data = getData();
        data[0] = {
            ...data[0],
            useTextArea: true,
            title: 'Here is textarea. Can save only by CTRL + ENTER.'
        };
        this._viewSource = new Memory({ keyProperty: 'id', data });
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
