import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/EditInPlace/GroupedEmptySource/GroupedEmptySource';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {groupConstants as constView} from 'Controls/list';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _fakeItemId: number;
    private _editingConfig = {
        editOnClick: false,
        sequentialEditing: true,
        addPosition: 'top'
    };

    protected _beforeMount(): void {
        const data = [];
        this._viewSource = new Memory({
            keyProperty: 'id',
            data
        });
        this._fakeItemId = data.length;
    }

    private _groupingKeyCallback(item: Model): string {
        const groupId = item.get('brand');
        return groupId === 'apple' ? constView.hiddenGroup : groupId;
    }

    protected _beginAdd(): void {
        const item = new Model({
            keyProperty: 'id',
            rawData: {
                id: ++this._fakeItemId,
                title: '',
                brand: 'asd'
            }
        });
        this._children.list.beginAdd({item});
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
